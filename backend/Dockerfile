# Python slim image for smaller footprint
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System dependencies (optional, keep minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency file first for better caching
COPY requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

# Copy project files
COPY .. /app

EXPOSE 8000

# Run migrations then start the dev server
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
