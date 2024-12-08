# Stage 1: Build stage
FROM python:3.12 AS builder

# Set the working directory
WORKDIR /app

# Copy only necessary files for installing dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime stage
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Copy the installed dependencies from the builder stage
COPY --from=builder /install /usr/local

# Copy the application code
COPY . .

# Copy the service account JSON file
COPY ./config/flask-app-service-account.json /app/config/service-account.json

# Expose the port
EXPOSE 5000

# Set the default command
CMD ["python", "app.py"]
