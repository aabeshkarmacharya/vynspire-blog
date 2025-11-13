import json
import pytest


pytestmark = pytest.mark.django_db


def test_register_success_and_duplicate(client):
    # First registration should succeed
    res = client.post(
        '/register/',
        data=json.dumps({'username': 'alice', 'password': 'pass1234'}),
        content_type='application/json',
    )
    assert res.status_code == 201
    body = res.json()
    assert 'user' in body
    assert body['user']['username'] == 'alice'

    # Duplicate username should fail with 400
    res2 = client.post(
        '/register/',
        data=json.dumps({'username': 'alice', 'password': 'pass1234'}),
        content_type='application/json',
    )
    assert res2.status_code == 400
    assert 'error' in res2.json()


def test_login_success_and_invalid(client, django_user_model):
    # Create user
    django_user_model.objects.create_user(username='bob', password='secretpw')

    # Valid login
    res = client.post(
        '/login/',
        data=json.dumps({'username': 'bob', 'password': 'secretpw'}),
        content_type='application/json',
    )
    assert res.status_code == 200
    body = res.json()
    assert 'tokens' in body
    assert 'access' in body['tokens']
    assert 'refresh' in body['tokens']

    # Invalid login
    res2 = client.post(
        '/login/',
        data=json.dumps({'username': 'bob', 'password': 'wrong'}),
        content_type='application/json',
    )
    assert res2.status_code == 401
    assert 'error' in res2.json()


def test_refresh_requires_valid_refresh_token(client, django_user_model):
    # Create user and login to get refresh token
    django_user_model.objects.create_user(username='carl', password='abc12345')
    login_res = client.post(
        '/login/',
        data=json.dumps({'username': 'carl', 'password': 'abc12345'}),
        content_type='application/json',
    )
    assert login_res.status_code == 200
    refresh_token = login_res.json()['tokens']['refresh']

    # Use refresh endpoint
    ok = client.post(
        '/api/auth/refresh',
        data=json.dumps({'refresh': refresh_token}),
        content_type='application/json',
    )
    assert ok.status_code == 200
    assert 'access' in ok.json()

    # Invalid token should yield 401
    bad = client.post(
        '/api/auth/refresh',
        data=json.dumps({'refresh': 'not-a-token'}),
        content_type='application/json',
    )
    assert bad.status_code == 401
    assert 'error' in bad.json()
