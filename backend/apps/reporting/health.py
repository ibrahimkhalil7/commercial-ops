from django.db import connection
from django.db.utils import OperationalError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    db_ok = True
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
    except OperationalError:
        db_ok = False

    status_code = 200 if db_ok else 503
    return Response(
        {
            'status': 'ok' if db_ok else 'degraded',
            'database': 'reachable' if db_ok else 'unreachable',
        },
        status=status_code,
    )
