from django.apps import AppConfig


class AuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    # Use the full Python path for the app and set a unique label to avoid
    # clashing with django.contrib.auth's default 'auth' label
    name = 'auth'
    label = 'custom_auth'
