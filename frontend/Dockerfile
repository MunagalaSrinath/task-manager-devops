# Stage 1: Build the React application
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the React source code
COPY . .

# Build the production application
RUN npm run build


# Stage 2: Serve the production application
FROM nginx:alpine

# Copy React build output to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]