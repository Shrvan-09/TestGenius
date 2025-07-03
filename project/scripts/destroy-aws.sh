#!/bin/bash
# destroy-aws.sh: Tears down the AWS stack
# Usage: ./destroy-aws.sh

set -e

STACK_NAME="testgenius-stack"
REGION="us-east-1"

aws cloudformation delete-stack --stack-name $STACK_NAME --region $REGION

echo "Stack deletion initiated. Check AWS Console for progress."
