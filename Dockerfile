# 1단계: 빌드 환경 (Vite로 정적 파일 빌드)
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# 2단계: 실행 환경 (Nginx로 정적 파일 서빙)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]