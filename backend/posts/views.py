import json
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt

from auth.views import jwt_required
from .models import Post


def _json_error(message: str, status: int = 400):
    return JsonResponse({'error': message}, status=status)


def _parse_json_body(request: HttpRequest):
    try:
        return json.loads(request.body.decode('utf-8') or '{}')
    except json.JSONDecodeError:
        return {}


def _post_to_dict(post: Post):
    return {
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'author': post.author_id,
        'created_at': post.created_at.isoformat(),
    }


@csrf_exempt
def posts(request: HttpRequest):
    if request.method == 'GET':
        # Pagination params
        try:
            page = int(request.GET.get('page', '1'))
        except (TypeError, ValueError):
            page = 1
        try:
            page_size = int(request.GET.get('page_size', '10'))
        except (TypeError, ValueError):
            page_size = 10

        # Normalize values
        if page < 1:
            page = 1
        if page_size <= 0:
            page_size = 10
        if page_size > 100:
            page_size = 100

        qs = Post.objects.all()
        total = qs.count()
        start = (page - 1) * page_size
        end = start + page_size
        records = list(qs[start:end]) if start < total else []
        items = [_post_to_dict(p) for p in records]

        total_pages = (total + page_size - 1) // page_size if page_size else 0
        return JsonResponse({
            'count': total,
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages,
            'results': items,
        })
    elif request.method == 'POST':
        # Require JWT for creation
        return _create_post(request)
    return _json_error('Method not allowed', status=405)


@csrf_exempt
@jwt_required
def _create_post(request: HttpRequest):
    if request.method != 'POST':
        return _json_error('Method not allowed', status=405)
    data = _parse_json_body(request)
    title = (data.get('title') or '').strip()
    content = (data.get('content') or '').strip()
    if not title or not content:
        return _json_error('title and content are required', status=400)
    post = Post.objects.create(title=title, content=content, author=request.user)
    return JsonResponse(_post_to_dict(post), status=201)


@csrf_exempt
def post_detail(request: HttpRequest, post_id: int):
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return _json_error('not found', status=404)

    if request.method == 'GET':
        return JsonResponse(_post_to_dict(post))
    elif request.method == 'PUT':
        return _update_post(request, post)
    elif request.method == 'DELETE':
        return _delete_post(request, post)
    return _json_error('Method not allowed', status=405)


@csrf_exempt
@jwt_required
def _update_post(request: HttpRequest, post: Post):
    if post.author_id != request.user.id:
        return _json_error('forbidden', status=403)
    data = _parse_json_body(request)
    title = data.get('title')
    content = data.get('content')
    changed = False
    if isinstance(title, str) and title.strip():
        post.title = title.strip()
        changed = True
    if isinstance(content, str) and content.strip():
        post.content = content.strip()
        changed = True
    if changed:
        post.save()
    return JsonResponse(_post_to_dict(post))


@csrf_exempt
@jwt_required
def _delete_post(request: HttpRequest, post: Post):
    if post.author_id != request.user.id:
        return _json_error('forbidden', status=403)
    post.delete()
    return JsonResponse({'deleted': True})
