from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    """
    Public endpoint: POST { username, email, password } to create a new user.
    Login itself happens at /api/token/ (already wired up with SimpleJWT).
    """
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
