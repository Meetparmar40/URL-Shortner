cd "m:/Coding/web development/URL shortener"

# Remove the old remote
git remote remove origin

# Add your new GitHub repo
git remote add origin https://github.com/Meetparmar40/URL-Shortner.git

# Verify it's correct
git remote -v

# Now push
git branch -M main
git push -u origin main# AWS DynamoDB + EC2 + S3 Deployment Checklist

## ✅ Backend Fully Migrated to DynamoDB

All code has been updated:
- ✅ `backend/package.json` — Removed mongoose, added `@aws-sdk/client-dynamodb` + `@aws-sdk/lib-dynamodb`
- ✅ `backend/.env` — Updated to AWS env vars (no MONGO_URI)
- ✅ `backend/src/utils/dynamodb.ts` — New DynamoDB client setup + helper functions
- ✅ `backend/src/models/User.ts` — Replaced with DynamoDB interfaces
- ✅ `backend/src/models/Url.ts` — Replaced with DynamoDB interfaces
- ✅ `backend/src/controllers/authController.ts` — Uses DynamoDB user functions
- ✅ `backend/src/controllers/urlController.ts` — Uses DynamoDB URL functions
- ✅ `backend/src/server.ts` — Removes MongoDB connection, initializes DynamoDB
- ✅ `npm run build` succeeds

## 🚀 Quick Local Test (DynamoDB Local)

```bash
# Option 1: Use AWS SDK to test without actual AWS (requires local DynamoDB started)
# Option 2: Deploy straight to AWS (no local testing needed)
```

## 📋 AWS Setup Steps (Do This Next)

### 1. Create DynamoDB Tables

Copy and paste into AWS CLI or console:

```bash
aws dynamodb create-table \
  --table-name users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

aws dynamodb create-table \
  --table-name urls \
  --attribute-definitions \
    AttributeName=shortCode,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema AttributeName=shortCode,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=userId-createdAt-index,KeySchema=[{AttributeName=userId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2. Launch EC2 (Ubuntu 22.04)

- Instance type: `t3.micro` or `t4g.micro` (free tier eligible)
- Security group: Allow inbound on `22` (SSH) and `5000` (backend API)
- **Attach IAM role** with DynamoDB permissions:

Add inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/users",
        "arn:aws:dynamodb:us-east-1:*:table/urls",
        "arn:aws:dynamodb:us-east-1:*:table/users/index/email-index",
        "arn:aws:dynamodb:us-east-1:*:table/urls/index/userId-createdAt-index"
      ]
    }
  ]
}
```

### 3. Deploy Backend to EC2

```bash
# SSH in
ssh -i /path/to/key.pem ubuntu@<EC2_PUBLIC_IP>

# Install dependencies
sudo apt update && sudo apt install -y git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Clone and setup
git clone <your-repo-url>
cd "URL shortener"
npm run install:all

# Configure
cp backend/.env.example backend/.env
# Edit backend/.env:
#   JWT_SECRET=my-secret-key-here
#   BASE_URL=http://<EC2_PUBLIC_IP>:5000 (or HTTPS domain)
#   AWS_REGION=us-east-1

# Build + run
npm run build
npm start
```

### 4. Test Backend

```bash
# In another terminal on EC2 or from your machine:
curl -X POST http://<EC2_PUBLIC_IP>:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Response should be 201 with user data
```

### 5. Deploy Frontend to S3 + CloudFront

```bash
# From project root (on your local machine or EC2)
npm run build --prefix frontend

# Create S3 bucket (once)
aws s3 mb s3://my-url-shortener-app --region us-east-1

# Upload built files
aws s3 sync frontend/dist s3://my-url-shortener-app/ --delete

# Create CloudFront distribution:
# - Origin: S3 bucket
# - Default root object: index.html
# - Add custom error response: 404 → /index.html (for SPA routing)
```

### 6. Update Frontend API Base URL

Edit `frontend/src/api/api.ts` or add env var to point to EC2 backend.

Current: Uses relative paths `/auth`, `/url` (works if backend serves frontend)

If needed for separate domain:
```typescript
const API_BASE = "http://<EC2_PUBLIC_IP>:5000";
// Then prefix all routes: `${API_BASE}/auth/signup`
```

## 🎯 Cost Estimates (AWS Free Tier)

- **EC2**: `t3.micro` = Free (750 hours/month for 12 months)
- **DynamoDB**: On-demand pricing = Free first 25 GB/month (easily enough for testing)
- **S3**: Free first 5 GB/month
- **CloudFront**: Free first 1 TB/month

**Total: ~$0/month for learning if you stay in free tier limits.**

## 🔒 Security Checklist

- [ ] DynamoDB tables use encryption at rest
- [ ] EC2 security group limits SSH + API to known IPs (optional for learning)
- [ ] IAM role uses least-privilege DynamoDB permissions
- [ ] `JWT_SECRET` is strong (min 32 chars)
- [ ] `BASE_URL` is HTTPS in production (use ACM + ALB or CloudFlare)

## 📝 Files Modified / Created

- `backend/package.json` ✏️
- `backend/.env` ✏️
- `backend/.env.example` ✏️
- `backend/src/utils/dynamodb.ts` ✨ (NEW)
- `backend/src/models/User.ts` ✏️
- `backend/src/models/Url.ts` ✏️
- `backend/src/controllers/authController.ts` ✏️
- `backend/src/controllers/urlController.ts` ✏️
- `backend/src/server.ts` ✏️
- `README.md` ✏️

## ✅ Next: Ready to Deploy!

1. Set up DynamoDB tables (CLI command above)
2. Launch EC2 + attach IAM role
3. SSH in and deploy backend
4. Upload frontend to S3
5. Point CloudFront to S3 + update API URLs
6. Test!

---

**Questions?** Check `README.md` for full step-by-step instructions.
