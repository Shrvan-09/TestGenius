#!/bin/bash
# deploy-aws.sh: Professional AWS deployment with load balancing, caching, auto-scaling
# Features: ALB, CloudFront, ElastiCache, RDS, Auto Scaling, VPC, Security Groups
# Usage: ./deploy-aws.sh [environment]

set -e

# Configuration
ENVIRONMENT="${1:-dev}"
STACK_NAME="testgenius-${ENVIRONMENT}"
TEMPLATE_FILE="../cloudformation-advanced.yaml"
REGION="us-east-1"
S3_BUCKET="testgenius-deployments-${ENVIRONMENT}"
APP_NAME="TestGenius"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting AWS deployment for ${APP_NAME} (${ENVIRONMENT})${NC}"

# Check AWS CLI configuration
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not configured. Run 'aws configure' first.${NC}"
    exit 1
fi

# Create S3 bucket for deployments if it doesn't exist
if ! aws s3 ls "s3://${S3_BUCKET}" 2>&1 | grep -q 'NoSuchBucket'; then
    echo -e "${YELLOW}📦 Creating S3 bucket for deployments...${NC}"
    aws s3 mb "s3://${S3_BUCKET}" --region ${REGION}
fi

# Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
cd ..
npm install
npm run build

# Package CloudFormation template
echo -e "${YELLOW}📦 Packaging CloudFormation template...${NC}"
aws cloudformation package \
    --template-file ${TEMPLATE_FILE} \
    --s3-bucket ${S3_BUCKET} \
    --output-template-file packaged-template.yaml \
    --region ${REGION}

# Deploy infrastructure
echo -e "${YELLOW}🏗️ Deploying infrastructure...${NC}"
aws cloudformation deploy \
    --template-file packaged-template.yaml \
    --stack-name ${STACK_NAME} \
    --capabilities CAPABILITY_NAMED_IAM \
    --region ${REGION} \
    --parameter-overrides \
        Environment=${ENVIRONMENT} \
        AppName=${APP_NAME} \
    --tags \
        Environment=${ENVIRONMENT} \
        Project=${APP_NAME} \
        Owner="$(aws sts get-caller-identity --query Arn --output text)"

# Get stack outputs
echo -e "${YELLOW}📊 Getting deployment information...${NC}"
FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucket`].OutputValue' \
    --output text --region ${REGION})

CLOUDFRONT_DIST_ID=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text --region ${REGION})

ALB_DNS=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
    --output text --region ${REGION})

CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
    --output text --region ${REGION})

# Deploy frontend to S3 + CloudFront
echo -e "${YELLOW}🌐 Deploying frontend to S3 + CloudFront...${NC}"
aws s3 sync dist/ "s3://${FRONTEND_BUCKET}" --delete
aws cloudfront create-invalidation \
    --distribution-id ${CLOUDFRONT_DIST_ID} \
    --paths "/*" \
    --region ${REGION}

# Wait for deployment to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
aws cloudformation wait stack-update-complete --stack-name ${STACK_NAME} --region ${REGION} || true

# Health check
echo -e "${YELLOW}🏥 Running health checks...${NC}"
./health-check.sh ${ALB_DNS}

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌍 Application URLs:${NC}"
echo -e "  Frontend (CloudFront): ${CLOUDFRONT_URL}"
echo -e "  Backend (Load Balancer): http://${ALB_DNS}"
echo -e "  Environment: ${ENVIRONMENT}"
echo -e "${GREEN}📈 Monitoring:${NC}"
echo -e "  CloudWatch: https://console.aws.amazon.com/cloudwatch/home?region=${REGION}"
echo -e "  Auto Scaling: https://console.aws.amazon.com/ec2/autoscaling/home?region=${REGION}"
echo -e "${GREEN}🎯 Ready for resume showcase!${NC}"
