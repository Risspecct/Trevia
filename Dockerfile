# --- Stage 1: Builder ---
FROM python:3.11-slim AS builder
WORKDIR /build

# Install build dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential

COPY requirements.txt .
# Install to a prefix to easily copy to final stage
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Stage 2: Final Runtime ---
FROM python:3.11-slim
WORKDIR /app

# Copy only the installed packages from builder
COPY --from=builder /install /usr/local
COPY ./app ./app

# Ensure non-buffered logging for better Docker logs
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Start using the module path (app.main)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]