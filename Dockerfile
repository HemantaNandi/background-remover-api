# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0
RUN pip install --no-cache-dir -r requirements.txt

# Copy the .env file first
COPY .env .

# Copy the rest of the application's code into the container at /app
COPY . .

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Run the application
EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]