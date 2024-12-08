# Stage 1: Build stage
FROM node:20 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Stage 2: Runtime stage
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app .

# Create uploads directory
RUN mkdir -p uploads

# Expose the port the app runs on
EXPOSE 3000

# Set default environment variable
ENV FLASK_SERVER_URL=http://flask-server:5000

# Define the command to run the app
CMD ["npm", "start", "server.js"]
