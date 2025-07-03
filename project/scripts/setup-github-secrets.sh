#!/bin/bash
# setup-github-secrets.sh: Helper script to set up GitHub secrets for CI/CD
# Usage: ./setup-github-secrets.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔐 GitHub Secrets Setup for TestGenius CI/CD${NC}"
echo "================================================="

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not found. Please install: https://cli.github.com/${NC}"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}🔑 Please authenticate with GitHub CLI:${NC}"
    gh auth login
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo -e "${GREEN}📦 Repository: ${REPO}${NC}"

echo -e "${YELLOW}🚀 Setting up GitHub secrets...${NC}"

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_description=$2
    
    echo -e "${YELLOW}Enter ${secret_description}:${NC}"
    read -s secret_value
    
    if [[ -n "$secret_value" ]]; then
        echo "$secret_value" | gh secret set "$secret_name"
        echo -e "${GREEN}✅ ${secret_name} set successfully${NC}"
    else
        echo -e "${RED}❌ ${secret_name} skipped (empty value)${NC}"
    fi
}

# Set up AWS secrets
echo -e "${YELLOW}🔧 AWS Development Environment Secrets:${NC}"
set_secret "AWS_ACCESS_KEY_ID" "AWS Access Key ID (Development)"
set_secret "AWS_SECRET_ACCESS_KEY" "AWS Secret Access Key (Development)"

echo -e "${YELLOW}🔧 AWS Production Environment Secrets:${NC}"
set_secret "AWS_ACCESS_KEY_ID_PROD" "AWS Access Key ID (Production)"
set_secret "AWS_SECRET_ACCESS_KEY_PROD" "AWS Secret Access Key (Production)"

# Optional: Slack webhook
echo -e "${YELLOW}🔔 Optional: Slack Notification Setup:${NC}"
echo "Enter Slack Webhook URL (or press Enter to skip):"
read slack_webhook
if [[ -n "$slack_webhook" ]]; then
    echo "$slack_webhook" | gh secret set "SLACK_WEBHOOK_URL"
    echo -e "${GREEN}✅ SLACK_WEBHOOK_URL set successfully${NC}"
else
    echo -e "${YELLOW}⏭️ Slack notifications skipped${NC}"
fi

# List all secrets
echo -e "${YELLOW}📋 Current GitHub secrets:${NC}"
gh secret list

echo -e "${GREEN}🎉 GitHub secrets setup complete!${NC}"
echo -e "${GREEN}🚀 Your CI/CD pipeline is now ready!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Push changes to 'develop' branch to trigger dev deployment"
echo "2. Push changes to 'main' branch to trigger production deployment"
echo "3. Monitor deployments at: https://github.com/${REPO}/actions"
echo ""
echo -e "${GREEN}🎯 Happy deploying!${NC}"
