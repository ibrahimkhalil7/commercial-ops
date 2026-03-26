#!/usr/bin/env python
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

try:
    if not User.objects.filter(email='admin@example.com').exists():
        User.objects.create_superuser(
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            password='admin123'
        )
        print('✅ Admin user created successfully!')
        print('Email: admin@example.com')
        print('Password: admin123')
    else:
        print('✅ Admin user already exists')
        print('Email: admin@example.com')
        print('Password: admin123')
except Exception as e:
    print(f'Error: {e}')
