FROM python:3.11-slim

WORKDIR /app

# install dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# copy backend code
COPY backend ./backend

WORKDIR /app/backend

EXPOSE 8000

# Use app_db for PostgreSQL support (production)
CMD ["uvicorn", "app_db:app", "--host", "0.0.0.0", "--port", "8000"]
