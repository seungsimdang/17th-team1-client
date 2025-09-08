#!/bin/bash

echo "🚀 Starting deployment..."

# 기존 컨테이너 중지 및 제거
echo "📦 Stopping existing containers..."
docker-compose down

# 기존 이미지 제거 (선택사항)
echo "🗑️  Removing old images..."
docker image prune -f

# 새 이미지 빌드 및 실행
echo "🔨 Building and starting containers..."
docker-compose up --build -d

# 컨테이너 상태 확인
echo "✅ Checking container status..."
docker-compose ps

echo "🎉 Deployment completed!"
echo "🌐 Your app should be available at: http://35.239.106.41:3000"
