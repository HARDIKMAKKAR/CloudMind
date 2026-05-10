FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy remaining code
COPY . .

# Expose port (adjust if needed)
EXPOSE 3000

# Start server
CMD ["npm", "run", "dev"]