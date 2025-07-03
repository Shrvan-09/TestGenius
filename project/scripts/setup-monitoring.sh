#!/bin/bash
# setup-monitoring.sh: Sets up CloudWatch dashboards and alarms for professional monitoring
# Usage: ./setup-monitoring.sh <stack-name> <environment>

set -e

STACK_NAME="${1:-testgenius-dev}"
ENVIRONMENT="${2:-dev}"
REGION="us-east-1"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📊 Setting up monitoring for ${STACK_NAME}...${NC}"

# Create CloudWatch Dashboard
aws cloudwatch put-dashboard \
    --dashboard-name "TestGenius-${ENVIRONMENT}-Dashboard" \
    --dashboard-body '{
        "widgets": [
            {
                "type": "metric",
                "x": 0,
                "y": 0,
                "width": 12,
                "height": 6,
                "properties": {
                    "metrics": [
                        [ "AWS/ApplicationELB", "RequestCount", "LoadBalancer", "'$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' --output text)'" ],
                        [ ".", "TargetResponseTime", ".", "." ],
                        [ ".", "HTTPCode_Target_2XX_Count", ".", "." ],
                        [ ".", "HTTPCode_Target_4XX_Count", ".", "." ],
                        [ ".", "HTTPCode_Target_5XX_Count", ".", "." ]
                    ],
                    "period": 300,
                    "stat": "Sum",
                    "region": "'$REGION'",
                    "title": "Load Balancer Metrics"
                }
            },
            {
                "type": "metric",
                "x": 0,
                "y": 6,
                "width": 12,
                "height": 6,
                "properties": {
                    "metrics": [
                        [ "AWS/AutoScaling", "GroupDesiredCapacity", "AutoScalingGroupName", "'$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`AutoScalingGroupName`].OutputValue' --output text)'" ],
                        [ ".", "GroupInServiceInstances", ".", "." ],
                        [ ".", "GroupTotalInstances", ".", "." ]
                    ],
                    "period": 300,
                    "stat": "Average",
                    "region": "'$REGION'",
                    "title": "Auto Scaling Group"
                }
            },
            {
                "type": "metric",
                "x": 0,
                "y": 12,
                "width": 12,
                "height": 6,
                "properties": {
                    "metrics": [
                        [ "AWS/EC2", "CPUUtilization", "AutoScalingGroupName", "'$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`AutoScalingGroupName`].OutputValue' --output text)'" ],
                        [ ".", "NetworkIn", ".", "." ],
                        [ ".", "NetworkOut", ".", "." ]
                    ],
                    "period": 300,
                    "stat": "Average",
                    "region": "'$REGION'",
                    "title": "EC2 Instance Metrics"
                }
            },
            {
                "type": "metric",
                "x": 0,
                "y": 18,
                "width": 12,
                "height": 6,
                "properties": {
                    "metrics": [
                        [ "AWS/CloudFront", "Requests", "DistributionId", "'$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' --output text)'" ],
                        [ ".", "BytesDownloaded", ".", "." ],
                        [ ".", "4xxErrorRate", ".", "." ],
                        [ ".", "5xxErrorRate", ".", "." ]
                    ],
                    "period": 300,
                    "stat": "Sum",
                    "region": "us-east-1",
                    "title": "CloudFront CDN Metrics"
                }
            }
        ]
    }' \
    --region $REGION

echo -e "${GREEN}✅ CloudWatch Dashboard created: TestGenius-${ENVIRONMENT}-Dashboard${NC}"
echo -e "${GREEN}📊 View at: https://console.aws.amazon.com/cloudwatch/home?region=${REGION}#dashboards:name=TestGenius-${ENVIRONMENT}-Dashboard${NC}"

# Set up SNS topic for alerts
TOPIC_ARN=$(aws sns create-topic --name "TestGenius-${ENVIRONMENT}-Alerts" --region $REGION --query TopicArn --output text)
echo -e "${GREEN}📧 SNS Topic created: $TOPIC_ARN${NC}"

# Create additional alarms
aws cloudwatch put-metric-alarm \
    --alarm-name "TestGenius-${ENVIRONMENT}-HighLatency" \
    --alarm-description "High response time detected" \
    --metric-name TargetResponseTime \
    --namespace AWS/ApplicationELB \
    --statistic Average \
    --period 300 \
    --threshold 2.0 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions $TOPIC_ARN \
    --dimensions Name=LoadBalancer,Value="$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' --output text)" \
    --region $REGION

echo -e "${GREEN}✅ Monitoring setup complete!${NC}"
echo -e "${GREEN}🎯 Professional monitoring ready for resume showcase!${NC}"
