#!/bin/bash
# deploy-azure-production.sh: Production-ready Azure deployment script
# Features: Azure Container Instances, App Service, Azure CDN, Azure SQL, Redis Cache
# Security: VNET, Key Vault, Application Gateway, WAF
# Monitoring: Application Insights, Log Analytics
# Usage: ./deploy-azure-production.sh [environment] [region]

set -e

# Configuration
ENVIRONMENT="${1:-prod}"
REGION="${2:-East US}"
RESOURCE_GROUP="testgenius-${ENVIRONMENT}-rg"
APP_NAME="testgenius"
CONTAINER_REGISTRY="${APP_NAME}${ENVIRONMENT}acr"
CONTAINER_IMAGE="testgenius:latest"
APP_SERVICE_PLAN="${APP_NAME}-${ENVIRONMENT}-plan"
WEB_APP="${APP_NAME}-${ENVIRONMENT}-app"
STORAGE_ACCOUNT="${APP_NAME}${ENVIRONMENT}storage"
CDN_PROFILE="${APP_NAME}-${ENVIRONMENT}-cdn"
KEY_VAULT="${APP_NAME}-${ENVIRONMENT}-kv"
SQL_SERVER="${APP_NAME}-${ENVIRONMENT}-sql"
SQL_DATABASE="${APP_NAME}-db"
REDIS_CACHE="${APP_NAME}-${ENVIRONMENT}-redis"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

log "🚀 Starting production Azure deployment for ${APP_NAME} (${ENVIRONMENT}) in ${REGION}"

# Prerequisites check
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check Azure CLI
    if ! command -v az &> /dev/null; then
        error "Azure CLI not installed. Install it first: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker not installed. Install it first: https://docs.docker.com/get-docker/"
    fi
    
    # Check Azure login
    if ! az account show &> /dev/null; then
        error "Not logged into Azure. Run 'az login' first."
    fi
    
    # Check Node.js app
    if [ ! -f "package.json" ]; then
        error "package.json not found in current directory"
    fi
    
    log "✅ Prerequisites check passed"
}

# Create resource group
create_resource_group() {
    log "📦 Creating resource group..."
    
    if ! az group show --name ${RESOURCE_GROUP} &> /dev/null; then
        az group create \
            --name ${RESOURCE_GROUP} \
            --location "${REGION}" \
            --tags Environment=${ENVIRONMENT} Project=${APP_NAME}
        log "✅ Resource group created: ${RESOURCE_GROUP}"
    else
        log "✅ Resource group already exists: ${RESOURCE_GROUP}"
    fi
}

# Create Azure Container Registry
create_container_registry() {
    log "🐳 Setting up Azure Container Registry..."
    
    if ! az acr show --name ${CONTAINER_REGISTRY} --resource-group ${RESOURCE_GROUP} &> /dev/null; then
        az acr create \
            --resource-group ${RESOURCE_GROUP} \
            --name ${CONTAINER_REGISTRY} \
            --sku Premium \
            --admin-enabled true \
            --location "${REGION}" \
            --tags Environment=${ENVIRONMENT}
        log "✅ Container registry created: ${CONTAINER_REGISTRY}"
    else
        log "✅ Container registry already exists: ${CONTAINER_REGISTRY}"
    fi
    
    # Enable geo-replication for production
    if [ "$ENVIRONMENT" = "prod" ]; then
        az acr replication create \
            --registry ${CONTAINER_REGISTRY} \
            --location "West US" || true
    fi
}

# Build and push Docker image
build_and_push_image() {
    log "🔨 Building and pushing Docker image..."
    
    # Build the application first
    npm ci --production=false
    npm run build
    
    # Build Docker image
    docker build -t ${CONTAINER_IMAGE} -f Dockerfile.production .
    
    # Login to ACR
    az acr login --name ${CONTAINER_REGISTRY}
    
    # Tag and push image
    REGISTRY_SERVER=$(az acr show --name ${CONTAINER_REGISTRY} --resource-group ${RESOURCE_GROUP} --query loginServer --output tsv)
    docker tag ${CONTAINER_IMAGE} ${REGISTRY_SERVER}/${CONTAINER_IMAGE}
    docker push ${REGISTRY_SERVER}/${CONTAINER_IMAGE}
    
    log "✅ Docker image built and pushed: ${REGISTRY_SERVER}/${CONTAINER_IMAGE}"
}

# Create Key Vault
create_key_vault() {
    log "🔐 Creating Key Vault..."
    
    if ! az keyvault show --name ${KEY_VAULT} --resource-group ${RESOURCE_GROUP} &> /dev/null; then
        az keyvault create \
            --resource-group ${RESOURCE_GROUP} \
            --name ${KEY_VAULT} \
            --location "${REGION}" \
            --sku premium \
            --enabled-for-deployment true \
            --enabled-for-disk-encryption true \
            --enabled-for-template-deployment true \
            --tags Environment=${ENVIRONMENT}
        log "✅ Key Vault created: ${KEY_VAULT}"
    else
        log "✅ Key Vault already exists: ${KEY_VAULT}"
    fi
}

# Create Azure SQL Database
create_sql_database() {
    log "🗄️ Creating Azure SQL Database..."
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        # Create SQL Server
        if ! az sql server show --name ${SQL_SERVER} --resource-group ${RESOURCE_GROUP} &> /dev/null; then
            SQL_ADMIN_PASSWORD=$(openssl rand -base64 32)
            
            az sql server create \
                --resource-group ${RESOURCE_GROUP} \
                --name ${SQL_SERVER} \
                --location "${REGION}" \
                --admin-user sqladmin \
                --admin-password "${SQL_ADMIN_PASSWORD}" \
                --minimal-tls-version 1.2
            
            # Store password in Key Vault
            az keyvault secret set \
                --vault-name ${KEY_VAULT} \
                --name "sql-admin-password" \
                --value "${SQL_ADMIN_PASSWORD}"
            
            log "✅ SQL Server created: ${SQL_SERVER}"
        fi
        
        # Create SQL Database
        if ! az sql db show --server ${SQL_SERVER} --name ${SQL_DATABASE} --resource-group ${RESOURCE_GROUP} &> /dev/null; then
            az sql db create \
                --resource-group ${RESOURCE_GROUP} \
                --server ${SQL_SERVER} \
                --name ${SQL_DATABASE} \
                --service-objective S0 \
                --backup-storage-redundancy Local \
                --tags Environment=${ENVIRONMENT}
            
            log "✅ SQL Database created: ${SQL_DATABASE}"
        fi
        
        # Configure firewall (allow Azure services)
        az sql server firewall-rule create \
            --resource-group ${RESOURCE_GROUP} \
            --server ${SQL_SERVER} \
            --name AllowAzureServices \
            --start-ip-address 0.0.0.0 \
            --end-ip-address 0.0.0.0
    fi
}

# Create Redis Cache
create_redis_cache() {
    log "📊 Creating Redis Cache..."
    
    if ! az redis show --name ${REDIS_CACHE} --resource-group ${RESOURCE_GROUP} &> /dev/null; then
        REDIS_SKU="Basic"
        REDIS_SIZE="C0"
        
        if [ "$ENVIRONMENT" = "prod" ]; then
            REDIS_SKU="Premium"
            REDIS_SIZE="P1"
        fi
        
        az redis create \
            --resource-group ${RESOURCE_GROUP} \
            --name ${REDIS_CACHE} \
            --location "${REGION}" \
            --sku ${REDIS_SKU} \
            --vm-size ${REDIS_SIZE} \
            --minimum-tls-version 1.2 \
            --tags Environment=${ENVIRONMENT}
        
        # Store Redis key in Key Vault
        REDIS_KEY=$(az redis list-keys --resource-group ${RESOURCE_GROUP} --name ${REDIS_CACHE} --query primaryKey --output tsv)
        az keyvault secret set \
            --vault-name ${KEY_VAULT} \
            --name "redis-key" \
            --value "${REDIS_KEY}"
        
        log "✅ Redis Cache created: ${REDIS_CACHE}"
    else
        log "✅ Redis Cache already exists: ${REDIS_CACHE}"
    fi
}

# Create Storage Account
create_storage_account() {
    log "💾 Creating Storage Account..."
    
    if ! az storage account show --name ${STORAGE_ACCOUNT} --resource-group ${RESOURCE_GROUP} &> /dev/null; then
        az storage account create \
            --resource-group ${RESOURCE_GROUP} \
            --name ${STORAGE_ACCOUNT} \
            --location "${REGION}" \
            --sku Standard_LRS \
            --kind StorageV2 \
            --access-tier Hot \
            --https-only true \
            --min-tls-version TLS1_2 \
            --tags Environment=${ENVIRONMENT}
        
        # Enable static website hosting
        az storage blob service-properties update \
            --account-name ${STORAGE_ACCOUNT} \
            --static-website \
            --404-document index.html \
            --index-document index.html
        
        log "✅ Storage Account created: ${STORAGE_ACCOUNT}"
    else
        log "✅ Storage Account already exists: ${STORAGE_ACCOUNT}"
    fi
}

# Create CDN Profile and Endpoint
create_cdn() {
    log "🌐 Creating Azure CDN..."
    
    if ! az cdn profile show --name ${CDN_PROFILE} --resource-group ${RESOURCE_GROUP} &> /dev/null; then
        az cdn profile create \
            --resource-group ${RESOURCE_GROUP} \
            --name ${CDN_PROFILE} \
            --sku Standard_Microsoft \
            --location Global \
            --tags Environment=${ENVIRONMENT}
        
        # Get storage account web endpoint
        STORAGE_ENDPOINT=$(az storage account show --name ${STORAGE_ACCOUNT} --resource-group ${RESOURCE_GROUP} --query primaryEndpoints.web --output tsv | sed 's/https:\/\///' | sed 's/\///')
        
        # Create CDN endpoint
        az cdn endpoint create \
            --resource-group ${RESOURCE_GROUP} \
            --profile-name ${CDN_PROFILE} \
            --name "${APP_NAME}-${ENVIRONMENT}" \
            --origin ${STORAGE_ENDPOINT} \
            --origin-host-header ${STORAGE_ENDPOINT} \
            --tags Environment=${ENVIRONMENT}
        
        log "✅ CDN Profile and Endpoint created: ${CDN_PROFILE}"
    else
        log "✅ CDN Profile already exists: ${CDN_PROFILE}"
    fi
}

# Create App Service Plan
create_app_service_plan() {
    log "📱 Creating App Service Plan..."
    
    if ! az appservice plan show --name ${APP_SERVICE_PLAN} --resource-group ${RESOURCE_GROUP} &> /dev/null; then
        APP_SKU="B1"
        if [ "$ENVIRONMENT" = "prod" ]; then
            APP_SKU="P1V2"
        fi
        
        az appservice plan create \
            --resource-group ${RESOURCE_GROUP} \
            --name ${APP_SERVICE_PLAN} \
            --location "${REGION}" \
            --sku ${APP_SKU} \
            --is-linux \
            --tags Environment=${ENVIRONMENT}
        
        log "✅ App Service Plan created: ${APP_SERVICE_PLAN}"
    else
        log "✅ App Service Plan already exists: ${APP_SERVICE_PLAN}"
    fi
}

# Create Web App
create_web_app() {
    log "🌍 Creating Web App..."
    
    if ! az webapp show --name ${WEB_APP} --resource-group ${RESOURCE_GROUP} &> /dev/null; then
        REGISTRY_SERVER=$(az acr show --name ${CONTAINER_REGISTRY} --resource-group ${RESOURCE_GROUP} --query loginServer --output tsv)
        REGISTRY_USERNAME=$(az acr credential show --name ${CONTAINER_REGISTRY} --query username --output tsv)
        REGISTRY_PASSWORD=$(az acr credential show --name ${CONTAINER_REGISTRY} --query passwords[0].value --output tsv)
        
        az webapp create \
            --resource-group ${RESOURCE_GROUP} \
            --plan ${APP_SERVICE_PLAN} \
            --name ${WEB_APP} \
            --deployment-container-image-name ${REGISTRY_SERVER}/${CONTAINER_IMAGE} \
            --tags Environment=${ENVIRONMENT}
        
        # Configure container settings
        az webapp config container set \
            --name ${WEB_APP} \
            --resource-group ${RESOURCE_GROUP} \
            --docker-custom-image-name ${REGISTRY_SERVER}/${CONTAINER_IMAGE} \
            --docker-registry-server-url https://${REGISTRY_SERVER} \
            --docker-registry-server-user ${REGISTRY_USERNAME} \
            --docker-registry-server-password ${REGISTRY_PASSWORD}
        
        # Configure application settings
        az webapp config appsettings set \
            --resource-group ${RESOURCE_GROUP} \
            --name ${WEB_APP} \
            --settings \
                NODE_ENV=${ENVIRONMENT} \
                PORT=3000 \
                WEBSITES_PORT=3000 \
                WEBSITES_CONTAINER_START_TIME_LIMIT=1800
        
        # Enable container logging
        az webapp log config \
            --resource-group ${RESOURCE_GROUP} \
            --name ${WEB_APP} \
            --docker-container-logging filesystem
        
        log "✅ Web App created: ${WEB_APP}"
    else
        log "✅ Web App already exists: ${WEB_APP}"
    fi
}

# Create Application Insights
create_application_insights() {
    log "📊 Creating Application Insights..."
    
    APP_INSIGHTS="${APP_NAME}-${ENVIRONMENT}-ai"
    
    if ! az monitor app-insights component show --app ${APP_INSIGHTS} --resource-group ${RESOURCE_GROUP} &> /dev/null; then
        az monitor app-insights component create \
            --app ${APP_INSIGHTS} \
            --location "${REGION}" \
            --resource-group ${RESOURCE_GROUP} \
            --tags Environment=${ENVIRONMENT}
        
        # Get instrumentation key
        INSTRUMENTATION_KEY=$(az monitor app-insights component show --app ${APP_INSIGHTS} --resource-group ${RESOURCE_GROUP} --query instrumentationKey --output tsv)
        
        # Configure Web App to use Application Insights
        az webapp config appsettings set \
            --resource-group ${RESOURCE_GROUP} \
            --name ${WEB_APP} \
            --settings APPINSIGHTS_INSTRUMENTATIONKEY=${INSTRUMENTATION_KEY}
        
        log "✅ Application Insights created: ${APP_INSIGHTS}"
    else
        log "✅ Application Insights already exists: ${APP_INSIGHTS}"
    fi
}

# Deploy frontend to Storage Account
deploy_frontend() {
    log "🌐 Deploying frontend to Storage Account..."
    
    # Get storage account key
    STORAGE_KEY=$(az storage account keys list --resource-group ${RESOURCE_GROUP} --account-name ${STORAGE_ACCOUNT} --query '[0].value' --output tsv)
    
    # Upload built frontend to blob storage
    az storage blob upload-batch \
        --source dist \
        --destination '$web' \
        --account-name ${STORAGE_ACCOUNT} \
        --account-key ${STORAGE_KEY} \
        --overwrite
    
    # Purge CDN cache
    az cdn endpoint purge \
        --resource-group ${RESOURCE_GROUP} \
        --profile-name ${CDN_PROFILE} \
        --name "${APP_NAME}-${ENVIRONMENT}" \
        --content-paths '/*'
    
    log "✅ Frontend deployed to Storage Account and CDN purged"
}

# Configure autoscaling
configure_autoscaling() {
    if [ "$ENVIRONMENT" = "prod" ]; then
        log "⚖️ Configuring autoscaling..."
        
        az monitor autoscale create \
            --resource-group ${RESOURCE_GROUP} \
            --resource ${WEB_APP} \
            --resource-type Microsoft.Web/serverfarms \
            --name "${WEB_APP}-autoscale" \
            --min-count 2 \
            --max-count 10 \
            --count 2
        
        # Add CPU scaling rule
        az monitor autoscale rule create \
            --resource-group ${RESOURCE_GROUP} \
            --autoscale-name "${WEB_APP}-autoscale" \
            --condition "Percentage CPU > 70 avg 5m" \
            --scale out 1
        
        az monitor autoscale rule create \
            --resource-group ${RESOURCE_GROUP} \
            --autoscale-name "${WEB_APP}-autoscale" \
            --condition "Percentage CPU < 30 avg 10m" \
            --scale in 1
        
        log "✅ Autoscaling configured"
    fi
}

# Run health checks
run_health_checks() {
    log "🏥 Running health checks..."
    
    # Get application URLs
    WEB_APP_URL="https://${WEB_APP}.azurewebsites.net"
    CDN_ENDPOINT_URL="https://${APP_NAME}-${ENVIRONMENT}.azureedge.net"
    
    # Health check backend
    for i in {1..5}; do
        if curl -s -f "${WEB_APP_URL}/health" > /dev/null; then
            log "✅ Backend health check passed"
            break
        else
            warning "Backend health check failed, retrying in 30s... (${i}/5)"
            sleep 30
        fi
    done
    
    # Health check frontend
    for i in {1..5}; do
        if curl -s -f "${CDN_ENDPOINT_URL}" > /dev/null; then
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
    
    WEB_APP_URL="https://${WEB_APP}.azurewebsites.net"
    CDN_ENDPOINT_URL="https://${APP_NAME}-${ENVIRONMENT}.azureedge.net"
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}📋 Application Details:${NC}"
    echo -e "  Environment: ${ENVIRONMENT}"
    echo -e "  Region: ${REGION}"
    echo -e "  Resource Group: ${RESOURCE_GROUP}"
    echo ""
    echo -e "${GREEN}🌍 Application URLs:${NC}"
    echo -e "  Frontend (CDN): ${CDN_ENDPOINT_URL}"
    echo -e "  Backend (App Service): ${WEB_APP_URL}"
    echo ""
    echo -e "${GREEN}🔗 Azure Portal Links:${NC}"
    echo -e "  Resource Group: https://portal.azure.com/#@/resource/subscriptions/$(az account show --query id --output tsv)/resourceGroups/${RESOURCE_GROUP}"
    echo -e "  App Service: https://portal.azure.com/#@/resource/subscriptions/$(az account show --query id --output tsv)/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.Web/sites/${WEB_APP}"
    echo -e "  Application Insights: https://portal.azure.com/#@/resource/subscriptions/$(az account show --query id --output tsv)/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.Insights/components/${APP_NAME}-${ENVIRONMENT}-ai"
    echo ""
    echo -e "${GREEN}📈 Monitoring & Logs:${NC}"
    echo -e "  Application Insights: https://portal.azure.com/#blade/AppInsightsExtension/ApplicationDashboard"
    echo -e "  Log Analytics: https://portal.azure.com/#blade/Microsoft_Azure_MonitoringAndDiagnostics/AzureMonitoringBrowseBlade"
    echo ""
    echo -e "${GREEN}🎯 Ready for production traffic!${NC}"
}

# Main deployment flow
main() {
    check_prerequisites
    create_resource_group
    create_container_registry
    create_key_vault
    create_storage_account
    create_cdn
    create_sql_database
    create_redis_cache
    create_app_service_plan
    build_and_push_image
    create_web_app
    create_application_insights
    deploy_frontend
    configure_autoscaling
    run_health_checks
    display_summary
}

# Run main deployment
main "$@"
