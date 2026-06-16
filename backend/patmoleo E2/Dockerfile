FROM python:3.10-slim

# Set up a non-root user (Hugging Face Spaces requirement for Docker)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY --chown=user:user api/requirements.txt ./api/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r api/requirements.txt

# Copy the rest of the application (both api and fine-tuning are needed)
COPY --chown=user:user . .

# Change working directory to the api folder where main.py is
WORKDIR /app/api

# Hugging Face Spaces expose port 7860 by default
EXPOSE 7860

# Run FastAPI with uvicorn on port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
