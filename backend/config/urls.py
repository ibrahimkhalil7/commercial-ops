"""
URL routing for commercial operations platform.
Includes API endpoints for all apps.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.decorators.cache import cache_page
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse

urlpatterns = [
    # Health check endpoint
    path('health/', lambda request: JsonResponse({'status': 'ok'})),
    path('admin/', admin.site.urls),
    
    # JWT Authentication endpoints
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API endpoints for all apps
    path('api/users/', include('apps.users.urls', namespace='users')),
    path('api/outlets/', include('apps.outlets.urls', namespace='outlets')),
    path('api/routes/', include('apps.routes.urls', namespace='routes')),
    path('api/visits/', include('apps.visits.urls', namespace='visits')),
    path('api/notices/', include('apps.notices.urls', namespace='notices')),
    path('api/maintenance/', include('apps.maintenance.urls', namespace='maintenance')),
    path('api/reporting/', include('apps.reporting.urls', namespace='reporting')),
    
    # Serve React frontend for all other routes (must be last)
    re_path(r'^(?!api/)(?!admin/)(?!static/).*$',
            TemplateView.as_view(template_name='index.html'),
            name='react_app'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
