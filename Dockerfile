FROM node:20-bullseye-slim

# Install system deps (git for GitHub deps, build tools for native modules)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only files needed for install first (better caching)
COPY package.json package-lock.json* ./
COPY .npmrc* ./

# If your package-lock.json is up-to-date, prefer ci. Otherwise, use install.
RUN npm ci --omit=optional
# RUN npm install

# (Optional) ensure ffmpeg linux binary is present in container
RUN npm install @ffmpeg-installer/linux-x64 --force

# Copy the rest of the app
COPY . .

# Environment (adjust as needed)
ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

# Start the bot
CMD ["node", "main.js"]
