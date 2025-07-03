#!/bin/bash
# deploy-aws-production.sh: Production-ready AWS deployment script
# Features: ECS Fargate, ALB, CloudFront, RDS, ElastiCache, CloudWatch, Auto Scaling
# Security: VPC, Security Groups, SSL/TLS, IAM roles, WAF
# Monitoring: CloudWatch, X-Ray, Health checks
# Usage: ./deploy-aws-production.sh [environment] [region]

set -e

# Configuration
ENVIRONMENT="${1:-prod}"
REGION="${2:-us-east-1}"
STACK_NAME="testgenius-${ENVIRONMENT}"
APP_NAME="TestGenius"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_FILE="${PROJECT_DIR}/cloudformation-production.yaml"
S3_BUCKET="testgenius-deployments-${ENVIRONMENT}-${REGION}"
ECR_REPOSITORY="testgenius-${ENVIRONMENT}"
DOCKER_IMAGE_TAG="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    error "Environment must be one of: dev, staging, prod"
fi

log "🚀 Starting production AWS deployment for ${APP_NAME} (${ENVIRONMENT}) in ${REGION}"

# Prerequisites check
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI not installed. Install it first: https://aws.amazon.com/cli/"
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker not installed. Install it first: https://docs.docker.com/get-docker/"
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured. Run 'aws configure' first."
    fi
    
    # Check if template exists
    if [ ! -f "${TEMPLATE_FILE}" ]; then
        error "CloudFormation template not found: ${TEMPLATE_FILE}"
    fi
    
    # Check if Node.js app exists
    if [ ! -f "${PROJECT_DIR}/package.json" ]; then
        error "package.json not found in project directory"
    fi
    
    log "✅ Prerequisites check passed"
}

# Build and push Docker image
build_and_push_image() {
    log "🐳 Building and pushing Docker image..."
    
    # Create ECR repository if it doesn't exist
    if ! aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${REGION} &> /dev/null; then
        info "Creating ECR repository: ${ECR_REPOSITORY}"
        aws ecr create-repository --repository-name ${ECR_REPOSITORY} --region ${REGION}
    fi
    
    # Get ECR login token
    aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin $(aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${REGION} --query 'repositories[0].repositoryUri' --output text | cut -d'/' -f1)
    
    # Build Docker image
    cd "${PROJECT_DIR}"
    DOCKER_IMAGE_URI=$(aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${REGION} --query 'repositories[0].repositoryUri' --output text)
    
    docker build -t ${ECR_REPOSITORY}:${DOCKER_IMAGE_TAG} -f Dockerfile.production .
    docker tag ${ECR_REPOSITORY}:${DOCKER_IMAGE_TAG} ${DOCKER_IMAGE_URI}:${DOCKER_IMAGE_TAG}
    docker push ${DOCKER_IMAGE_URI}:${DOCKER_IMAGE_TAG}
    
    log "✅ Docker image built and pushed: ${DOCKER_IMAGE_URI}:${DOCKER_IMAGE_TAG}"
    echo "DOCKER_IMAGE_URI=${DOCKER_IMAGE_URI}:${DOCKER_IMAGE_TAG}" > /tmp/docker-image-uri.env
}

# Create S3 bucket for deployments
create_s3_bucket() {
    log "📦 Setting up S3 bucket for deployments..."
    
    if ! aws s3 ls "s3://${S3_BUCKET}" &> /dev/null; then
        if [ "$REGION" = "us-east-1" ]; then
            aws s3 mb "s3://${S3_BUCKET}"
        else
            aws s3 mb "s3://${S3_BUCKET}" --region ${REGION}
        fi
        
        # Enable versioning
        aws s3api put-bucket-versioning --bucket ${S3_BUCKET} --versioning-configuration Status=Enabled
        
        # Enable encryption
        aws s3api put-bucket-encryption --bucket ${S3_BUCKET} --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }
            ]
        }'
        
        log "✅ S3 bucket created and configured: ${S3_BUCKET}"
    else
        log "✅ S3 bucket already exists: ${S3_BUCKET}"
    fi
}

# Build frontend application
build_frontend() {
    log "🏗️ Building frontend application..."
    
    cd "${PROJECT_DIR}"
    
    # Install dependencies
    npm ci --production=false
    
    # Run security audit
    npm audit fix --audit-level moderate || warning "Some security vulnerabilities could not be auto-fixed"
    
    # Build the application
    npm run build
    
    # Verify build
    if [ ! -d "dist" ]; then
        error "Build failed - dist directory not found"
    fi
    
    log "✅ Frontend built successfully"
}

# Deploy infrastructure
deploy_infrastructure() {
    log "🏗️ Deploying infrastructure..."
    
    # Load Docker image URI
    source /tmp/docker-image-uri.env
    
    # Package CloudFormation template
    aws cloudformation package \
        --template-file ${TEMPLATE_FILE} \
        --s3-bucket ${S3_BUCKET} \
        --output-template-file packaged-template.yaml \
        --region ${REGION}
    
    # Deploy stack
    aws cloudformation deploy \
        --template-file packaged-template.yaml \
        --stack-name ${STACK_NAME} \
        --capabilities CAPABILITY_NAMED_IAM \
        --region ${REGION} \
        --parameter-overrides \
            Environment=${ENVIRONMENT} \
            AppName=${APP_NAME} \
            DockerImageUri=${DOCKER_IMAGE_URI} \
        --tags \
            Environment=${ENVIRONMENT} \
            Project=${APP_NAME} \
            DeployedBy="$(aws sts get-caller-identity --query Arn --output text)" \
            DeployedAt="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    log "✅ Infrastructure deployed successfully"
}

# Deploy frontend to S3 and CloudFront
deploy_frontend() {
    log "🌐 Deploying frontend to S3 and CloudFront..."
    
    # Get stack outputs
    FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucket`].OutputValue' \
        --output text --region ${REGION})
    
    CLOUDFRONT_DIST_ID=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
        --output text --region ${REGION})
    
    # Deploy to S3
    aws s3 sync dist/ "s3://${FRONTEND_BUCKET}" --delete --cache-control "max-age=31536000"
    
    # Set cache control for HTML files
    aws s3 cp "s3://${FRONTEND_BUCKET}/index.html" "s3://${FRONTEND_BUCKET}/index.html" --cache-control "max-age=0, no-cache, no-store, must-revalidate"
    
    # Invalidate CloudFront cache
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id ${CLOUDFRONT_DIST_ID} \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text \
        --region ${REGION})
    
    log "✅ Frontend deployed to S3 and CloudFront invalidation created: ${INVALIDATION_ID}"
}

# Wait for deployment to complete
wait_for_deployment() {
    log "⏳ Waiting for deployment to complete..."
    
    # Wait for CloudFormation stack
    aws cloudformation wait stack-deploy-complete --stack-name ${STACK_NAME} --region ${REGION}
    
    # Wait for ECS service to be stable
    ECS_CLUSTER=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`ECSCluster`].OutputValue' \
        --output text --region ${REGION})
    
    ECS_SERVICE=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`ECSService`].OutputValue' \
        --output text --region ${REGION})
    
    if [ ! -z "$ECS_CLUSTER" ] && [ ! -z "$ECS_SERVICE" ]; then
        aws ecs wait services-stable --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --region ${REGION}
    fi
    
    log "✅ Deployment completed successfully"
}

# Run health checks
run_health_checks() {
    log "🏥 Running health checks..."
    
    # Get application URLs
    ALB_DNS=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
        --output text --region ${REGION})
    
    CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
        --output text --region ${REGION})
    
    # Health check backend
    for i in {1..5}; do
        if curl -s -f "http://${ALB_DNS}/health" > /dev/null; then
            log "✅ Backend health check passed"
            break
        else
            warning "Backend health check failed, retrying in 30s... (${i}/5)"
            sleep 30
        fi
    done
    
    # Health check frontend
    for i in {1..5}; do
        if curl -s -f "${CLOUDFRONT_URL}" > /dev/null; then
            log "✅ Frontend health check passed"
            break
        else
            warning "Frontend health check failed, retrying in 30s... (${i}/5)"
            sleep 30
        fi
    done
    
    log "✅ Health checks completed"
}

# Display deployment summary
display_summary() {
    log "📊 Deployment Summary"
    
    # Get stack outputs
    CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
        --output text --region ${REGION})
    
    ALB_DNS=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
        --output text --region ${REGION})
    
    RDS_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`RDSEndpoint`].OutputValue' \
        --output text --region ${REGION} 2>/dev/null || echo "Not deployed")
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}📋 Application Details:${NC}"
    echo -e "  Environment: ${ENVIRONMENT}"
    echo -e "  Region: ${REGION}"
    echo -e "  Stack Name: ${STACK_NAME}"
    echo ""
    echo -e "${GREEN}🌍 Application URLs:${NC}"
    echo -e "  Frontend (CloudFront): ${CLOUDFRONT_URL}"
    echo -e "  Backend (Load Balancer): http://${ALB_DNS}"
    echo ""
    echo -e "${GREEN}🔗 AWS Console Links:${NC}"
    echo -e "  CloudFormation: https://console.aws.amazon.com/cloudformation/home?region=${REGION}#/stacks/stackinfo?stackId=${STACK_NAME}"
    echo -e "  ECS Cluster: https://console.aws.amazon.com/ecs/home?region=${REGION}#/clusters"
    echo -e "  CloudWatch: https://console.aws.amazon.com/cloudwatch/home?region=${REGION}"
    echo -e "  CloudFront: https://console.aws.amazon.com/cloudfront/home"
    echo ""
    echo -e "${GREEN}📈 Monitoring & Logs:${NC}"
    echo -e "  CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home?region=${REGION}#logsV2:log-groups"
    echo -e "  Application Insights: https://console.aws.amazon.com/systems-manager/appinsights"
    echo ""
    echo -e "${GREEN}🎯 Ready for production traffic!${NC}"
}

# Main deployment flow
main() {
    check_prerequisites
    create_s3_bucket
    build_frontend
    build_and_push_image
    deploy_infrastructure
    deploy_frontend
    wait_for_deployment
    run_health_checks
    display_summary
}

# Cleanup on exit
cleanup() {
    rm -f /tmp/docker-image-uri.env
    rm -f packaged-template.yaml
}
trap cleanup EXIT

# Run main deployment
main "$@"
