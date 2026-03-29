"""Views for users app."""
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import User, Team
from .serializers import UserSerializer, TeamSerializer


class IsAdminUserRole(permissions.BasePermission):
    """Allow only system admin role (or superuser)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_superuser or user.role == User.ADMIN))


class UserViewSet(viewsets.ModelViewSet):
    """User management viewset."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.action == 'me':
            return [IsAuthenticated()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == User.ADMIN:
            return User.objects.all()
        return User.objects.filter(id=user.id)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request, pk=None):
        user = self.get_object()
        if user != request.user and not (request.user.is_superuser or request.user.role == User.ADMIN):
            return Response(
                {'detail': 'You do not have permission to update this user.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class TeamViewSet(viewsets.ModelViewSet):
    """Team management viewset."""

    queryset = Team.objects.all().prefetch_related('members').select_related('manager')
    serializer_class = TeamSerializer
    permission_classes = [IsAdminUserRole]
    authentication_classes = [JWTAuthentication]
