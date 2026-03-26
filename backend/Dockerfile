FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY . .

# Create virtual environment and install dependencies
RUN python -m venv venv
RUN . venv/bin/activate && pip install --upgrade pip setuptools wheel
RUN . venv/bin/activate && pip install -r requirements-minimal.txt

# Copy built frontend files (will be provided from docker-compose)
COPY --chown=nobody:nobody frontend-dist/ ./static/ 2>/dev/null || true

# Create static and media directories
RUN mkdir -p static media

# Collect static files
RUN . venv/bin/activate && python manage.py collectstatic --noinput || true

EXPOSE 8000

# Run migrations and start server
CMD . venv/bin/activate && \
    python manage.py migrate && \
    python manage.py runserver 0.0.0.0:8000
