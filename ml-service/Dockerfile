FROM python:3.11

WORKDIR /app

# Copy requirements first
COPY requirements.txt .

# Install dependencies
RUN pip install --upgrade pip && \
    pip install --default-timeout=100 --no-cache-dir -r requirements.txt

# Copy rest of code
COPY . .

# Expose Flask port
EXPOSE 5000

# Run app
CMD ["python", "app.py"]