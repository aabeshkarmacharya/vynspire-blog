import pytest


@pytest.mark.django_db
def test_cors_preflight_register_allows_origin(client, settings):
    # Ensure DEBUG true implies allow all origins in settings configuration
    settings.DEBUG = True
    res = client.options(
        '/register/',
        HTTP_ORIGIN='http://localhost:3000',
        HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
        HTTP_ACCESS_CONTROL_REQUEST_HEADERS='content-type',
    )
    # django-cors-headers may return 200 or 204 depending on version
    assert res.status_code in (200, 204)
    allow_origin = res.headers.get('Access-Control-Allow-Origin')
    assert allow_origin in ('*', 'http://localhost:3000')


@pytest.mark.django_db
def test_cors_simple_post_register_has_allow_origin_header(client, settings):
    settings.DEBUG = True
    res = client.post(
        '/register/',
        data='{}',
        content_type='application/json',
        HTTP_ORIGIN='http://localhost:3000',
    )
    # Even on error, CORS header should be present
    allow_origin = res.headers.get('Access-Control-Allow-Origin')
    assert allow_origin in ('*', 'http://localhost:3000')
