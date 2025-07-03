#!/bin/bash
# Professional health check script for TestGenius AWS deployment
# Usage: ./health-check.sh <load-balancer-dns>

set -e

ALB_DNS="${1:-localhost}"
TIMEOUT=300
RETRY_INTERVAL=10
MAX_RETRIES=$((TIMEOUT / RETRY_INTERVAL))

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🏥 Starting health checks for TestGenius deployment...${NC}"

# Function to check endpoint
check_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo -e "${YELLOW}Checking ${description}...${NC}"
    
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
            echo -e "${GREEN}✅ ${description} is healthy${NC}"
            return 0
        else
            echo -e "${YELLOW}⏳ Waiting for ${description} (attempt $i/$MAX_RETRIES)...${NC}"
            sleep $RETRY_INTERVAL
        fi
    done
    
    echo -e "${RED}❌ ${description} health check failed${NC}"
    return 1
}

# Check backend health endpoint
check_endpoint "http://${ALB_DNS}/health" "200" "Backend API Health Endpoint"

# Check backend API endpoints
check_endpoint "http://${ALB_DNS}/api/test" "200" "Backend API Test Endpoint"

# Check if load balancer is distributing traffic
echo -e "${YELLOW}🔄 Checking load balancer distribution...${NC}"
for i in {1..5}; do
    response=$(curl -s "http://${ALB_DNS}/api/instance-id" || echo "failed")
    echo "Request $i: $response"
done

# Performance test
echo -e "${YELLOW}⚡ Running basic performance test...${NC}"
ab -n 100 -c 10 "http://${ALB_DNS}/health" || echo "Apache Bench not available"

echo -e "${GREEN}✅ Health checks completed successfully!${NC}"
echo -e "${GREEN}🎯 Your TestGenius deployment is ready for resume showcase!${NC}"
