"""
URL configuration for blog project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from auth import views as auth_views
from posts import views as posts_views

urlpatterns = [
    # Endpoints per task.yaml
    path('register/', auth_views.register, name='register'),
    path('login/', auth_views.login, name='login'),
    path('posts/', posts_views.posts, name='posts'),
    path('posts/<int:post_id>', posts_views.post_detail, name='post-detail'),
    # Auth endpoints (JWT)
    path('api/auth/register', auth_views.register, name='auth-register'),
    path('api/auth/login', auth_views.login, name='auth-login'),
    path('api/auth/refresh', auth_views.refresh, name='auth-refresh'),
]
