FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for building binary wheels (Pillow, psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY . .

# Remove local PIL stub if present (avoid shadowing real Pillow package)
RUN if [ -d backend/PIL ]; then rm -rf backend/PIL; fi

# Create virtual environment and install full requirements
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

# Copy built frontend files into Django static dir (optional)
# frontend build should be copied to frontend-dist/ before building image
COPY --chown=www-data:www-data frontend-dist/ ./static/ 2>/dev/null || true

# Create static and media directories
RUN mkdir -p static media

# Collect static files
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Copy and make entrypoint executable
COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
