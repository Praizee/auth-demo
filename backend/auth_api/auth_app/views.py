from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    ChangePasswordSerializer,
    ProfileSerializer,
    SignUpSerializer,
)

User = get_user_model()


def _build_token_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        "token": str(refresh.access_token),
        "refresh": str(refresh),
        "user": ProfileSerializer(user).data,
    }


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"

        return Response({
            "status": "ok",
            "database": db_status,
            "environment": "production",
        }, status=200)


class SignUpView(generics.CreateAPIView):
    serializer_class = SignUpSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        data = _build_token_response(user)
        return Response(data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"detail": "username and password are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=username).first()
        if user is None:
            user = User.objects.filter(username=username).first()

        if user is None or not user.check_password(password):
            return Response({"detail": "Invalid credentials."},
                            status=status.HTTP_401_UNAUTHORIZED)

        return Response(_build_token_response(user), status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)
