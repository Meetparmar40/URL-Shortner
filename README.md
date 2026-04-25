# URL Shortener (React + Express + DynamoDB)

Simple production-ready URL shortener with JWT auth, built for AWS (DynamoDB + EC2 + S3/CloudFront).

## Stack

- Frontend: React + TypeScript (Vite)
- Backend: Node.js + Express + TypeScript  
- Database: AWS DynamoDB
- Auth: JWT
- Password hashing: bcrypt
- Short code generation: nanoid

## Project Structure

```text
backend/
  src/
    controllers/
    models/
    routes/
    middleware/
    utils/
    server.ts

frontend/
  src/
    pages/
      Login.tsx
      Signup.tsx
      Dashboard.tsx
    components/
      UrlForm.tsx
      UrlList.tsx
    api/
      api.ts
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
JWT_SECRET=your-secret-key
BASE_URL=http://localhost:5000
AWS_REGION=us-east-1
USERS_TABLE=users
URLs_TABLE=urls
```

**Note:** If running on EC2 with IAM role, no AWS credentials in `.env` are needed (roles handle auth).

## Run with Docker (Recommended for Local Development)

The easiest way to run this project locally — **no AWS account or credentials needed**.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Option 1: Pull from Docker Hub (Easiest — No Cloning Required)

🐳 **Docker Hub**: [hub.docker.com/r/meetp40/url-shortener](https://hub.docker.com/r/meetp40/url-shortener)

Just download [`docker-compose.hub.yml`](docker-compose.hub.yml) and run:

```bash
docker compose -f docker-compose.hub.yml up
```

Or do it in one command (no files needed):

```bash
curl -O https://raw.githubusercontent.com/Meetparmar40/URL-Shortner/main/docker-compose.hub.yml
docker compose -f docker-compose.hub.yml up
```

Open **http://localhost:5000** — that's it! 🎉

### Option 2: Build from Source

```bash
git clone https://github.com/Meetparmar40/URL-Shortner.git
cd URL-Shortner
docker compose up --build
```

Open **http://localhost:5000**

### What Docker Sets Up

| Container | Purpose |
|-----------|---------|
| `dynamodb-local` | Local DynamoDB emulator (no AWS needed) |
| `dynamodb-init` | Auto-creates required tables, then exits |
| `url-shortener-app` | The full app (frontend + backend) on port 5000 |

### Useful Docker Commands

```bash
# Start in background
docker compose up -d

# View logs
docker compose logs -f app

# Stop everything
docker compose down
```

### Notes

- Data is stored in-memory and resets when containers stop
- The init container auto-creates tables on every startup
- Google OAuth won't work locally (email/password auth works perfectly)

---

## Local Run (Without Docker)

From project root:

```bash
npm run install:all
```

Run in development:

```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

Open `http://localhost:5173`.

## Production Build and Start

From project root:

```bash
npm run build
npm start
```

Backend serves frontend static build from `frontend/dist`.

## Deploy on AWS

### 1. Setup DynamoDB Tables

In AWS Console or via CLI:

```bash
# Users table
aws dynamodb create-table \
  --table-name users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=email-index,KeySchema={AttributeName=email,KeyType=HASH},Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# URLs table  
aws dynamodb create-table \
  --table-name urls \
  --attribute-definitions \
    AttributeName=shortCode,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=shortCode,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=userId-createdAt-index,KeySchema={AttributeName=userId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE},Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2. Backend on EC2

1. Launch EC2 (Ubuntu), allow inbound `22` and `5000`.
2. Attach IAM role with DynamoDB permissions:
   - `dynamodb:GetItem`
   - `dynamodb:PutItem`
   - `dynamodb:Query`
   - `dynamodb:UpdateItem`

3. SSH in:

```bash
ssh -i /path/to/key.pem ubuntu@<EC2_PUBLIC_IP>
```

4. Install Node 20 + git:

```bash
sudo apt update && sudo apt install -y git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

5. Clone, install, build:

```bash
git clone <repo-url>
cd "URL shortener"
npm run install:all
```

6. Configure backend:

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Set:
- `JWT_SECRET=<strong-random-value>`
- `AWS_REGION=us-east-1` (or your region)
- `USERS_TABLE=users` (or your table name)
- `URLs_TABLE=urls`
- `BASE_URL=http://<EC2_PUBLIC_IP>:5000` or HTTPS domain

7. Build and run:

```bash
npm run build
npm start
```

### 3. Frontend on S3 + CloudFront

1. Build frontend:

```bash
npm run build --prefix frontend
```

2. Create S3 bucket:

```bash
aws s3 mb s3://your-url-shortener-app --region us-east-1
```

3. Upload build:

```bash
aws s3 sync frontend/dist s3://your-url-shortener-app/
```

4. Create CloudFront distribution pointing to the S3 bucket.

5. Update frontend API calls to point to EC2 backend (via `BASE_URL` in backend env).

### Optional: Keep Backend Running with PM2

```bash
sudo npm install -g pm2
pm2 start npm --name url-shortener -- start
pm2 save
pm2 startup
```
