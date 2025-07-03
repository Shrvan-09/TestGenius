#!/bin/bash
# deploy-aws.sh: Professional AWS deployment with load balancing, caching, auto-scaling
# Features: ALB, CloudFront, ElastiCache, RDS, Auto Scaling, VPC, Security Groups
# Usage: ./deploy-aws.sh [environment]

set -e

# Configuration
ENVIRONMENT="${1:-dev}"
STACK_NAME="testgenius-${ENVIRONMENT}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_FILE="${PROJECT_DIR}/cloudformation-advanced.yaml"
REGION="us-east-1"
S3_BUCKET="testgenius-deployments-${ENVIRONMENT}"
APP_NAME="TestGenius"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting AWS deployment for ${APP_NAME} (${ENVIRONMENT})${NC}"
echo -e "${YELLOW}📂 Project directory: ${PROJECT_DIR}${NC}"
echo -e "${YELLOW}📄 Template file: ${TEMPLATE_FILE}${NC}"

# Check if CloudFormation template exists
if [ ! -f "${TEMPLATE_FILE}" ]; then
    echo -e "${RED}❌ CloudFormation template not found: ${TEMPLATE_FILE}${NC}"
    echo -e "${YELLOW}Available files in project directory:${NC}"
    ls -la "${PROJECT_DIR}"/ | grep -E "\.(yaml|yml)$" || echo "No YAML files found"
    exit 1
fi

# Check AWS CLI installation
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not installed${NC}"
    echo -e "${YELLOW}📥 Install AWS CLI:${NC}"
    echo "   curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    echo "   unzip awscliv2.zip"
    echo "   sudo ./aws/install"
    echo ""
    echo -e "${YELLOW}🔑 Then configure AWS CLI:${NC}"
    echo "   aws configure"
    exit 1
fi

# Check AWS CLI configuration
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not configured. Run 'aws configure' first.${NC}"
    echo -e "${YELLOW}💡 You need:${NC}"
    echo "   - AWS Access Key ID"
    echo "   - AWS Secret Access Key"
    echo "   - Default region (e.g., us-east-1)"
    echo "   - Output format (json)"
    exit 1
fi

# Create S3 bucket for deployments if it doesn't exist
if ! aws s3 ls "s3://${S3_BUCKET}" &> /dev/null; then
    echo -e "${YELLOW}📦 Creating S3 bucket for deployments...${NC}"
    aws s3 mb "s3://${S3_BUCKET}" --region ${REGION}
    echo -e "${GREEN}✅ S3 bucket created: ${S3_BUCKET}${NC}"
else
    echo -e "${GREEN}✅ S3 bucket already exists: ${S3_BUCKET}${NC}"
fi

# Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
cd "${PROJECT_DIR}"

# Update browserslist database
echo -e "${YELLOW}📱 Updating browserslist database...${NC}"
npx update-browserslist-db@latest 2>/dev/null || echo -e "${YELLOW}⚠️ Could not update browserslist database${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production=false

# Fix security vulnerabilities (non-breaking changes only)
echo -e "${YELLOW}🔒 Fixing security vulnerabilities...${NC}"
npm audit fix --only=prod 2>/dev/null || echo -e "${YELLOW}⚠️ Some vulnerabilities could not be auto-fixed${NC}"

# Build the application
echo -e "${YELLOW}🏗️ Building application...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Application built successfully${NC}"

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
cd "${SCRIPT_DIR}"
if [ -f "health-check-advanced.sh" ]; then
    ./health-check-advanced.sh ${ALB_DNS}
elif [ -f "health-check.sh" ]; then
    ./health-check.sh ${ALB_DNS}
else
    echo -e "${YELLOW}⚠️ Health check script not found, performing basic check...${NC}"
    if curl -s -o /dev/null -w "%{http_code}" "http://${ALB_DNS}/health" | grep -q "200"; then
        echo -e "${GREEN}✅ Basic health check passed${NC}"
    else
        echo -e "${RED}❌ Health check failed${NC}"
    fi
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌍 Application URLs:${NC}"
echo -e "  Frontend (CloudFront): ${CLOUDFRONT_URL}"
echo -e "  Backend (Load Balancer): http://${ALB_DNS}"
echo -e "  Environment: ${ENVIRONMENT}"
echo -e "${GREEN}📈 Monitoring:${NC}"
echo -e "  CloudWatch: https://console.aws.amazon.com/cloudwatch/home?region=${REGION}"
echo -e "  Auto Scaling: https://console.aws.amazon.com/ec2/autoscaling/home?region=${REGION}"
echo -e "${GREEN}🎯 Ready for resume showcase!${NC}"
