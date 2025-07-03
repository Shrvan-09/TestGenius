#!/bin/bash
# deploy-docker-aws.sh: Deploy using Docker containers on AWS ECS/Fargate
# Usage: ./deploy-docker-aws.sh [environment]

set -e

ENVIRONMENT="${1:-dev}"
CLUSTER_NAME="testgenius-${ENVIRONMENT}"
SERVICE_NAME="testgenius-service-${ENVIRONMENT}"
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/testgenius"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🐳 Starting Docker-based AWS deployment...${NC}"

# Build and push Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
cd ..
docker build -t testgenius:latest .
docker tag testgenius:latest ${ECR_REPO}:latest
docker tag testgenius:latest ${ECR_REPO}:${ENVIRONMENT}

# Login to ECR and push
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_REPO}
docker push ${ECR_REPO}:latest
docker push ${ECR_REPO}:${ENVIRONMENT}

# Deploy ECS service
echo -e "${YELLOW}🚀 Deploying to ECS...${NC}"
aws ecs update-service \
    --cluster ${CLUSTER_NAME} \
    --service ${SERVICE_NAME} \
    --force-new-deployment \
    --region ${REGION}

echo -e "${GREEN}✅ Docker deployment complete!${NC}"
echo -e "${GREEN}📊 Monitor at: https://console.aws.amazon.com/ecs/home?region=${REGION}#/clusters/${CLUSTER_NAME}/services${NC}"
