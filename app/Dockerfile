# Build Stage for Node.js and Vite
FROM node:21-alpine3.18 as vite-builder

WORKDIR /app/static
COPY ./static /app/static
RUN npm install
RUN npm run build

# Production Stage for Python and FastAPI
FROM tiangolo/uvicorn-gunicorn-fastapi:python3.9-slim as production

WORKDIR /app

# set env variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Vite app build from the build stage
COPY --from=vite-builder /app/static/dist/ /app/static/


# Copy the rest of the FastAPI application
COPY . .

# ... (rest of your Dockerfile)
