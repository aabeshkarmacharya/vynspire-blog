import json
import datetime as dt
from functools import wraps

import jwt
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse, HttpRequest
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

User = get_user_model()


def _jwt_now():
    return timezone.now()


def _minutes(minutes: int) -> dt.timedelta:
    return dt.timedelta(minutes=minutes)


def _days(days: int) -> dt.timedelta:
    return dt.timedelta(days=days)


def _generate_token(user: User, token_type: str):
    now = _jwt_now()
    if token_type == 'access':
        exp = now + _minutes(getattr(settings, 'JWT_ACCESS_TTL_MINUTES', 15))
    elif token_type == 'refresh':
        exp = now + _days(getattr(settings, 'JWT_REFRESH_TTL_DAYS', 7))
    else:
        raise ValueError('Invalid token type')
    payload = {
        'sub': str(user.id),
        'username': user.get_username(),
        'type': token_type,
        'iat': int(now.timestamp()),
        'exp': int(exp.timestamp()),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=getattr(settings, 'JWT_ALGORITHM', 'HS256'))
    # pyjwt v2 returns str; v1 returns bytes
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token


def generate_tokens(user: User):
    return {
        'access': _generate_token(user, 'access'),
        'refresh': _generate_token(user, 'refresh'),
    }


def _json_error(message: str, status: int = 400):
    return JsonResponse({'error': message}, status=status)


def _get_bearer_token(request: HttpRequest):
    auth = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
    if not auth:
        return None
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == 'bearer':
        return parts[1]
    return None


def jwt_required(view_func):
    @wraps(view_func)
    def wrapper(request: HttpRequest, *args, **kwargs):
        token = _get_bearer_token(request)
        if not token:
            return _json_error('Authorization token missing', status=401)
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[getattr(settings, 'JWT_ALGORITHM', 'HS256')],
                options={'require': ['exp', 'iat']},
            )
            if payload.get('type') != 'access':
                return _json_error('Invalid token type', status=401)
            user_id = payload.get('sub')
            try:
                request.user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return _json_error('User not found', status=401)
        except jwt.ExpiredSignatureError:
            return _json_error('Token expired', status=401)
        except jwt.InvalidTokenError:
            return _json_error('Invalid token', status=401)
        return view_func(request, *args, **kwargs)

    return wrapper


def _parse_json_body(request: HttpRequest):
    try:
        return json.loads(request.body.decode('utf-8') or '{}')
    except json.JSONDecodeError:
        return {}


@csrf_exempt
def register(request: HttpRequest):
    if request.method != 'POST':
        return _json_error('Method not allowed', status=405)
    data = _parse_json_body(request)
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    if not username or not password:
        return _json_error('username and password are required', status=400)
    if User.objects.filter(username=username).exists():
        return _json_error('username already taken', status=400)
    user = User(username=username, password=make_password(password))
    user.save()
    return JsonResponse({'user': {'id': user.id, 'username': user.username}}, status=201)


@csrf_exempt
def login(request: HttpRequest):
    if request.method != 'POST':
        return _json_error('Method not allowed', status=405)
    data = _parse_json_body(request)
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return _json_error('username and password are required', status=400)
    user = authenticate(request, username=username, password=password)
    if not user:
        return _json_error('Invalid credentials', status=401)
    tokens = generate_tokens(user)
    return JsonResponse({'tokens': tokens})


@csrf_exempt
def refresh(request: HttpRequest):
    if request.method != 'POST':
        return _json_error('Method not allowed', status=405)
    data = _parse_json_body(request)
    token = data.get('refresh') or data.get('token')
    if not token:
        return _json_error('refresh token is required', status=400)
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[getattr(settings, 'JWT_ALGORITHM', 'HS256')],
            options={'require': ['exp', 'iat']},
        )
        if payload.get('type') != 'refresh':
            return _json_error('Invalid token type', status=401)
        user_id = payload.get('sub')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return _json_error('User not found', status=401)
        access = _generate_token(user, 'access')
        return JsonResponse({'access': access})
    except jwt.ExpiredSignatureError:
        return _json_error('Token expired', status=401)
    except jwt.InvalidTokenError:
        return _json_error('Invalid token', status=401)

