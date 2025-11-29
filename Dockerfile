# Use Node.js LTS
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/api

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port (Render/Vercel ignore but good practice)
EXPOSE 5000

# Start command
CMD ["npm", "start"]
