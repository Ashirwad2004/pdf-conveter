FROM node:18-alpine

WORKDIR /app

COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages

# Install dependencies
RUN npm install

# Copy source
COPY apps/api ./apps/api

# Build
WORKDIR /app/apps/api
RUN npm run build

# Start
CMD ["npm", "start"]
