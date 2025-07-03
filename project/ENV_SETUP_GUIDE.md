# Environment Variables Setup Guide

## 📁 File Locations

The `.env` files should be placed in the **project root directory** (same level as `package.json`):

```
/workspaces/TestGenius/project/
├── .env                 # Local development (DO NOT commit)
├── .env.example         # Template file (safe to commit)
├── .env.staging         # Staging environment (DO NOT commit)
├── .env.prod           # Production environment (DO NOT commit)
├── package.json
├── server/
└── src/
```

## 🚀 Quick Setup

### 1. Copy Example File
```bash
cd project
cp .env.example .env
```

### 2. Generate Security Keys
```bash
# Generate JWT secret
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env

# Generate session secret  
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env

# Generate encryption key
echo "ENCRYPTION_KEY=$(openssl rand -base64 32 | head -c 32)" >> .env
```

### 3. Add Required API Keys
Edit `.env` and add your actual API keys:

```bash
# Get from Google AI Studio: https://aistudio.google.com/
GOOGLE_AI_API_KEY=your_actual_google_ai_api_key

# Get from OpenAI: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_actual_openai_api_key
```

## 🔧 Environment-Specific Configuration

### Local Development (.env)
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/testgenius_dev
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug
```

### Staging (.env.staging)
```bash
NODE_ENV=staging
PORT=3000
LOG_LEVEL=debug
RATE_LIMIT_MAX_REQUESTS=200
```

### Production (.env.prod)
```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔐 Required Variables by Category

### Core Application
- `NODE_ENV` - Environment (development/staging/production)
- `PORT` - Server port (3001 for dev, 3000 for production)

### AI Services
- `GOOGLE_AI_API_KEY` - For Gemini AI model
- `OPENAI_API_KEY` - For GPT models (optional)

### Security
- `JWT_SECRET` - For JSON Web Token signing
- `SESSION_SECRET` - For session encryption
- `ENCRYPTION_KEY` - For data encryption

### Database & Cache (Auto-configured in production)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

### Optional Services
- `SENDGRID_API_KEY` - Email notifications
- `SENTRY_DSN` - Error tracking
- `NEW_RELIC_LICENSE_KEY` - Performance monitoring

## 🛡️ Security Best Practices

### 1. Never Commit Secret Files
Ensure `.gitignore` contains:
```
.env
.env.local
.env.staging
.env.prod
```

### 2. Use Different Keys Per Environment
- Development: Use test/development API keys
- Staging: Use separate staging keys
- Production: Use production keys with proper limits

### 3. Key Rotation
- Rotate JWT secrets monthly in production
- Update API keys if compromised
- Use environment-specific database credentials

### 4. Access Control
- Limit who has access to production `.env` files
- Store production secrets in team password manager
- Use AWS Secrets Manager or Azure Key Vault for production

## 🚀 Deployment Integration

### AWS Deployment
The deployment script automatically:
1. Loads variables from `.env.${ENVIRONMENT}` or `.env`
2. Creates RDS and ElastiCache endpoints
3. Configures ECS task with all environment variables
4. Sets up proper CORS origins with CloudFront URL

### Azure Deployment  
The deployment script automatically:
1. Loads variables from environment-specific files
2. Creates Azure SQL and Redis Cache
3. Configures App Service with environment variables
4. Sets up Key Vault for secret management

## 🔍 Verification

### Check Environment Loading
```bash
# Start development server
npm run dev

# Check if environment variables are loaded
curl http://localhost:3001/api/health
```

### Test API Keys
```bash
# Test Google AI API
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Generate a simple test"}'
```

## 🐛 Common Issues

### "dotenv not found"
```bash
npm install dotenv
```

### "Environment variables not loading"
1. Check file location (must be in project root)
2. Verify file name (`.env` not `env.txt`)
3. Restart development server after changes

### "API key invalid"
1. Verify key is correct (no extra spaces)
2. Check API key permissions/quotas
3. Ensure key is for correct service (Google AI vs OpenAI)

### "Database connection failed"
For local development:
```bash
# Install PostgreSQL locally or use Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Install Redis locally or use Docker  
docker run --name redis -p 6379:6379 -d redis
```

## 📚 Additional Resources

- [Google AI Studio](https://aistudio.google.com/) - Get Google AI API key
- [OpenAI Platform](https://platform.openai.com/api-keys) - Get OpenAI API key
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) - Production secret management
- [Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/) - Azure secret management
