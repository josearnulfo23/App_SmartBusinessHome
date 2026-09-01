# SmartBusinessHome - Dockerfile multi-stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["node", "src/main/app.js"]
