FROM node:18-slim

# Install LibreOffice and dependencies
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-java-common \
    default-jre \
    fonts-opensymbol \
    hyphen-fr hyphen-de hyphen-en-us hyphen-it hyphen-ru \
    fonts-dejavu \
    fonts-dejavu-extra \
    fonts-liberation \
    fonts-droid-fallback \
    fonts-dustin \
    fonts-f500 \
    fonts-fanwood \
    fonts-freefont-ttf \
    fonts-liberation \
    fonts-lmodern \
    fonts-lyx \
    fonts-sil-gentium \
    fonts-texgyre \
    fonts-tlwg-purisa \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
COPY apps/worker/package.json ./apps/worker/
COPY packages ./packages

# Install dependencies (workspaces)
RUN npm install

# Copy source
COPY apps/worker ./apps/worker

# Build
WORKDIR /app/apps/worker
RUN npm run build

# Start
CMD ["npm", "start"]
