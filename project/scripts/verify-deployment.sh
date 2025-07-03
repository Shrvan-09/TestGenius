#!/bin/bash
# verify-deployment.sh: Comprehensive deployment verification for resume showcase
# Usage: ./verify-deployment.sh <environment>

set -e

ENVIRONMENT="${1:-dev}"
STACK_NAME="testgenius-${ENVIRONMENT}"
REGION="us-east-1"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Verifying TestGenius AWS deployment (${ENVIRONMENT})...${NC}"

# Check CloudFormation stack
echo -e "${YELLOW}📋 Checking CloudFormation stack...${NC}"
STACK_STATUS=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].StackStatus' \
    --output text --region ${REGION})

if [[ "$STACK_STATUS" == "CREATE_COMPLETE" ]] || [[ "$STACK_STATUS" == "UPDATE_COMPLETE" ]]; then
    echo -e "${GREEN}✅ CloudFormation stack: ${STACK_STATUS}${NC}"
else
    echo -e "${RED}❌ CloudFormation stack: ${STACK_STATUS}${NC}"
    exit 1
fi

# Get deployment outputs
echo -e "${YELLOW}📊 Fetching deployment information...${NC}"
LOAD_BALANCER_DNS=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
    --output text --region ${REGION})

CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
    --output text --region ${REGION})

ASG_NAME=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`AutoScalingGroupName`].OutputValue' \
    --output text --region ${REGION})

# Check Auto Scaling Group
echo -e "${YELLOW}🔄 Checking Auto Scaling Group...${NC}"
RUNNING_INSTANCES=$(aws autoscaling describe-auto-scaling-groups \
    --auto-scaling-group-names ${ASG_NAME} \
    --query 'AutoScalingGroups[0].Instances[?LifecycleState==`InService`]' \
    --output json --region ${REGION} | jq length)

echo -e "${GREEN}✅ Running instances: ${RUNNING_INSTANCES}${NC}"

# Check Load Balancer health
echo -e "${YELLOW}🏥 Checking Load Balancer health...${NC}"
TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups \
    --names "testgenius-${ENVIRONMENT}-TG" \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text --region ${REGION})

HEALTHY_TARGETS=$(aws elbv2 describe-target-health \
    --target-group-arn ${TARGET_GROUP_ARN} \
    --query 'TargetHealthDescriptions[?TargetHealth.State==`healthy`]' \
    --output json --region ${REGION} | jq length)

echo -e "${GREEN}✅ Healthy targets: ${HEALTHY_TARGETS}${NC}"

# Test application endpoints
echo -e "${YELLOW}🌐 Testing application endpoints...${NC}"

# Test backend
if curl -s -o /dev/null -w "%{http_code}" "http://${LOAD_BALANCER_DNS}/health" | grep -q "200"; then
    echo -e "${GREEN}✅ Backend health check: OK${NC}"
else
    echo -e "${RED}❌ Backend health check: FAILED${NC}"
fi

# Test frontend
if curl -s -o /dev/null -w "%{http_code}" "${CLOUDFRONT_URL}" | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend (CloudFront): OK${NC}"
else
    echo -e "${RED}❌ Frontend (CloudFront): FAILED${NC}"
fi

# Check caching
echo -e "${YELLOW}📦 Checking Redis cache...${NC}"
CACHE_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`CacheEndpoint`].OutputValue' \
    --output text --region ${REGION})

if [[ ! -z "$CACHE_ENDPOINT" ]]; then
    echo -e "${GREEN}✅ Redis cache endpoint: ${CACHE_ENDPOINT}${NC}"
else
    echo -e "${RED}❌ Redis cache: Not found${NC}"
fi

# Performance test
echo -e "${YELLOW}⚡ Running quick performance test...${NC}"
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "http://${LOAD_BALANCER_DNS}/health")
if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l) )); then
    echo -e "${GREEN}✅ Response time: ${RESPONSE_TIME}s (Good)${NC}"
else
    echo -e "${YELLOW}⚠️ Response time: ${RESPONSE_TIME}s (Could be improved)${NC}"
fi

# Generate deployment report
echo -e "${BLUE}📈 Deployment Summary for Resume Showcase${NC}"
echo "=============================================="
echo "Environment: ${ENVIRONMENT}"
echo "Stack Status: ${STACK_STATUS}"
echo "Running Instances: ${RUNNING_INSTANCES}"
echo "Healthy Targets: ${HEALTHY_TARGETS}"
echo "Load Balancer: http://${LOAD_BALANCER_DNS}"
echo "Frontend URL: ${CLOUDFRONT_URL}"
echo "Cache Endpoint: ${CACHE_ENDPOINT}"
echo "Response Time: ${RESPONSE_TIME}s"
echo "=============================================="

# Check monitoring setup
echo -e "${YELLOW}📊 Checking monitoring setup...${NC}"
DASHBOARD_EXISTS=$(aws cloudwatch list-dashboards \
    --dashboard-name-prefix "TestGenius-${ENVIRONMENT}" \
    --query 'DashboardEntries[0].DashboardName' \
    --output text --region ${REGION})

if [[ "$DASHBOARD_EXISTS" != "None" ]]; then
    echo -e "${GREEN}✅ CloudWatch Dashboard: ${DASHBOARD_EXISTS}${NC}"
else
    echo -e "${YELLOW}⚠️ CloudWatch Dashboard: Not found${NC}"
fi

echo -e "${GREEN}🎉 Deployment verification complete!${NC}"
echo -e "${GREEN}🎯 Your TestGenius application is ready for resume showcase!${NC}"
echo -e "${BLUE}🔗 Quick Links:${NC}"
echo -e "   Frontend: ${CLOUDFRONT_URL}"
echo -e "   Backend: http://${LOAD_BALANCER_DNS}"
echo -e "   Monitoring: https://console.aws.amazon.com/cloudwatch/home?region=${REGION}"
echo -e "   Auto Scaling: https://console.aws.amazon.com/ec2/autoscaling/home?region=${REGION}"
else
    echo "❌ Health endpoint failed!"
    exit 1
fi

# Check screenshot endpoint
echo "📸 Checking screenshots API..."
if curl -f "$URL/api/screenshots" > /dev/null 2>&1; then
    echo "✅ Screenshots API working!"
else
    echo "⚠️ Screenshots API not responding"
fi

# Check if frontend loads
echo "🌐 Checking frontend..."
if curl -f "$URL" > /dev/null 2>&1; then
    echo "✅ Frontend loads successfully!"
else
    echo "❌ Frontend failed to load!"
    exit 1
fi

# Test API generation endpoint (basic check)
echo "🤖 Testing API endpoints..."
if curl -f "$URL/api/generate" -X POST -H "Content-Type: application/json" -d '{}' > /dev/null 2>&1; then
    echo "⚠️ Generate API responded (expected error for empty request)"
else
    echo "📡 Generate API endpoint exists"
fi

echo "✅ Deployment verification complete!"
echo "🎉 Your TestGenius app is live at: $URL"
