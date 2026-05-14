#!/bin/sh
set -e

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Create superuser if env vars provided
if [ -n "$SUPERUSER_EMAIL" ] && [ -n "$SUPERUSER_PASSWORD" ]; then
  echo "Creating superuser if not exists: $SUPERUSER_EMAIL"
  python - <<PY
from django.contrib.auth import get_user_model
User = get_user_model()
email = "$SUPERUSER_EMAIL"
pw = "$SUPERUSER_PASSWORD"
first_name = "$SUPERUSER_FIRST_NAME" or "Admin"
last_name = "$SUPERUSER_LAST_NAME" or "User"
if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, password=pw, first_name=first_name, last_name=last_name)
    print('Superuser created')
else:
    print('Superuser already exists')
PY
fi

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --log-level info
