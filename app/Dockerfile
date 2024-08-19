# Production Stage for Python and FastAPI
FROM tiangolo/uvicorn-gunicorn-fastapi:python3.9-slim as production

WORKDIR /app

# set env variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the FastAPI application
COPY . .

# RUN python sethook.py

# ... (rest of your Dockerfile)

