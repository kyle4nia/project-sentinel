# Use an official lightweight Node.js image based on Alpine Linux
FROM node:14-alpine

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package files first for efficient caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app is listening on
EXPOSE 3000

# Define the command to run your app
CMD ["node", "Backend/index.js"]
COPY . .
