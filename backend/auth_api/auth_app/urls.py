from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    LoginView,
    LogoutView,
    ProfileView,
    SignUpView,
)

urlpatterns = [
    path("signup/",   SignUpView.as_view(),        name="auth-signup"),
    path("login/",    LoginView.as_view(),          name="auth-login"),
    path("logout/",   LogoutView.as_view(),         name="auth-logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("profile/",  ProfileView.as_view(),        name="auth-profile"),
    path("password/", ChangePasswordView.as_view(), name="auth-change-password"),
]
