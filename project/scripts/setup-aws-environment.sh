#!/bin/bash
# setup-aws-environment.sh: One-time setup for AWS deployment environment
# Usage: ./setup-aws-environment.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 TestGenius AWS Environment Setup${NC}"
echo "=============================================="

# Check if running on supported OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
else
    echo -e "${RED}❌ Unsupported OS. Please use Linux or macOS${NC}"
    exit 1
fi

# Step 1: Install AWS CLI
echo -e "${YELLOW}📥 Step 1: Installing AWS CLI v2...${NC}"
if command -v aws &> /dev/null; then
    echo -e "${GREEN}✅ AWS CLI already installed: $(aws --version)${NC}"
else
    echo -e "${YELLOW}⬇️ Downloading AWS CLI...${NC}"
    
    if [[ "$OS" == "linux" ]]; then
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf awscliv2.zip aws/
    elif [[ "$OS" == "mac" ]]; then
        curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
        sudo installer -pkg AWSCLIV2.pkg -target /
        rm AWSCLIV2.pkg
    fi
    
    echo -e "${GREEN}✅ AWS CLI installed successfully${NC}"
fi

# Step 2: Configure AWS CLI
echo -e "${YELLOW}🔑 Step 2: Configuring AWS CLI...${NC}"
if aws sts get-caller-identity &> /dev/null; then
    echo -e "${GREEN}✅ AWS CLI already configured${NC}"
    aws sts get-caller-identity
else
    echo -e "${YELLOW}📝 Please enter your AWS credentials:${NC}"
    echo "   You can get these from AWS Console → IAM → Users → Your User → Security Credentials"
    echo ""
    
    read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
    read -s -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
    echo ""
    read -p "Default region (e.g., us-east-1): " AWS_DEFAULT_REGION
    AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-us-east-1}
    
    # Configure AWS CLI
    aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
    aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
    aws configure set default.region "$AWS_DEFAULT_REGION"
    aws configure set default.output json
    
    echo -e "${GREEN}✅ AWS CLI configured successfully${NC}"
    
    # Test configuration
    if aws sts get-caller-identity &> /dev/null; then
        echo -e "${GREEN}✅ AWS credentials validated${NC}"
        aws sts get-caller-identity
    else
        echo -e "${RED}❌ AWS credentials validation failed${NC}"
        exit 1
    fi
fi

# Step 3: Install Node.js dependencies
echo -e "${YELLOW}📦 Step 3: Installing Node.js dependencies...${NC}"
cd "$(dirname "$0")/.."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 4: Create necessary AWS resources
echo -e "${YELLOW}🏗️ Step 4: Creating S3 bucket for deployments...${NC}"
BUCKET_NAME="testgenius-deployments-$(date +%s)"
if aws s3 mb "s3://${BUCKET_NAME}" --region "$(aws configure get region)"; then
    echo -e "${GREEN}✅ S3 bucket created: ${BUCKET_NAME}${NC}"
    echo "export S3_BUCKET=${BUCKET_NAME}" >> ~/.bashrc
else
    echo -e "${YELLOW}⚠️ S3 bucket creation failed, will create during deployment${NC}"
fi

# Step 5: Verify setup
echo -e "${YELLOW}🔍 Step 5: Verifying setup...${NC}"

# Check AWS CLI
if aws sts get-caller-identity &> /dev/null; then
    echo -e "${GREEN}✅ AWS CLI: Working${NC}"
else
    echo -e "${RED}❌ AWS CLI: Not working${NC}"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
else
    echo -e "${RED}❌ Node.js: Not found${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ npm: $(npm --version)${NC}"
else
    echo -e "${RED}❌ npm: Not found${NC}"
    exit 1
fi

# Final success message
echo ""
echo -e "${GREEN}🎉 AWS Environment Setup Complete!${NC}"
echo "=============================================="
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Deploy to development:"
echo "   cd scripts && ./deploy-aws.sh dev"
echo ""
echo "2. Deploy to production:"
echo "   cd scripts && ./deploy-aws.sh prod"
echo ""
echo "3. Set up GitHub secrets for CI/CD:"
echo "   cd scripts && ./setup-github-secrets.sh"
echo ""
echo -e "${GREEN}🎯 Your AWS environment is ready for TestGenius deployment!${NC}"
