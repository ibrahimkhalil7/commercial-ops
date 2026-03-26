"""Views for users app."""
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import User, Team
from .serializers import UserSerializer, TeamSerializer


class UserViewSet(viewsets.ModelViewSet):
    """User management viewset."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        """Allow unauthenticated access to certain actions."""
        if self.action in ['create']:
            return []
        return [IsAuthenticated()]

    def get_queryset(self):
        """Return only the current user unless they're an admin."""
        if self.request.user.is_superuser or self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current authenticated user details."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request, pk=None):
        """Update user profile."""
        user = self.get_object()
        if user != request.user and not request.user.is_superuser:
            return Response(
                {'detail': 'You do not have permission to update this user.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeamViewSet(viewsets.ModelViewSet):
    """Team management viewset."""
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
