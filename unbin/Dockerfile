# Dockerfile in unbin folder
FROM node:14

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source code
COPY . .

# Expose API port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
