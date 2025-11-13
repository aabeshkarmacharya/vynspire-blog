import json
import pytest
from posts.models import Post


pytestmark = pytest.mark.django_db


PASSWORD = 'pw123456'


@pytest.fixture
def author(django_user_model):
    return django_user_model.objects.create_user(username='author', password=PASSWORD)


@pytest.fixture
def other(django_user_model):
    return django_user_model.objects.create_user(username='other', password=PASSWORD)


def login_and_get_access(client, username='author', password=PASSWORD):
    res = client.post(
        '/login/',
        data=json.dumps({'username': username, 'password': password}),
        content_type='application/json',
    )
    assert res.status_code == 200
    return res.json()['tokens']['access']


def test_get_posts_pagination(client, author):
    # Create 15 posts
    posts = [Post(title=f'T{i}', content='c', author=author) for i in range(15)]
    Post.objects.bulk_create(posts)

    # Default page 1 page_size 10
    res = client.get('/posts/')
    assert res.status_code == 200
    data = res.json()
    assert data['count'] == 15
    assert data['page'] == 1
    assert data['page_size'] == 10
    assert data['total_pages'] == 2
    assert len(data['results']) == 10

    # Page 2 with size 5
    res2 = client.get('/posts/?page=2&page_size=5')
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2['page'] == 2
    assert data2['page_size'] == 5
    assert data2['total_pages'] == 3
    assert len(data2['results']) == 5


def test_create_requires_jwt_and_creates(client, author):
    # Without token
    res = client.post(
        '/posts/',
        data=json.dumps({'title': 'A', 'content': 'B'}),
        content_type='application/json',
    )
    assert res.status_code == 401

    # With token
    access = login_and_get_access(client, username='author')
    res2 = client.post(
        '/posts/',
        data=json.dumps({'title': 'A', 'content': 'B'}),
        content_type='application/json',
        HTTP_AUTHORIZATION=f'Bearer {access}',
    )
    assert res2.status_code == 201
    body = res2.json()
    assert body['title'] == 'A'
    assert body['content'] == 'B'
    assert body['author'] == author.id


def test_get_update_delete_post_with_permissions(client, author, other):
    # Create a post by author
    post = Post.objects.create(title='t', content='c', author=author)

    # Public get works
    get_res = client.get(f'/posts/{post.id}')
    assert get_res.status_code == 200
    assert get_res.json()['id'] == post.id

    # Non-author cannot update
    other_access = login_and_get_access(client, username='other')
    upd_forbidden = client.put(
        f'/posts/{post.id}',
        data=json.dumps({'title': 'x'}),
        content_type='application/json',
        HTTP_AUTHORIZATION=f'Bearer {other_access}',
    )
    assert upd_forbidden.status_code == 403

    # Author can update
    author_access = login_and_get_access(client, username='author')
    upd_ok = client.put(
        f'/posts/{post.id}',
        data=json.dumps({'title': 'new title'}),
        content_type='application/json',
        HTTP_AUTHORIZATION=f'Bearer {author_access}',
    )
    assert upd_ok.status_code == 200
    assert upd_ok.json()['title'] == 'new title'

    # Non-author cannot delete
    del_forbidden = client.delete(
        f'/posts/{post.id}',
        HTTP_AUTHORIZATION=f'Bearer {other_access}',
    )
    assert del_forbidden.status_code == 403

    # Author can delete
    del_ok = client.delete(
        f'/posts/{post.id}',
        HTTP_AUTHORIZATION=f'Bearer {author_access}',
    )
    assert del_ok.status_code == 200
    assert del_ok.json()['deleted'] is True

    # After delete, GET returns 404
    not_found = client.get(f'/posts/{post.id}')
    assert not_found.status_code == 404
    assert 'error' in not_found.json()
