#!/bin/sh
# Creates the DynamoDB tables required by the URL shortener.
# Runs inside the dynamodb-init container against DynamoDB Local.
# Idempotent — tolerates "table already exists" errors.

set -e

ENDPOINT="http://dynamodb-local:8000"
REGION="us-east-1"

echo "Waiting for DynamoDB Local to be ready..."
until aws dynamodb list-tables --endpoint-url "$ENDPOINT" --region "$REGION" > /dev/null 2>&1; do
  echo "  DynamoDB not ready yet, retrying in 2s..."
  sleep 2
done
echo "DynamoDB Local is ready!"

echo ""
echo "Creating 'users' table..."
aws dynamodb create-table \
  --endpoint-url "$ENDPOINT" \
  --region "$REGION" \
  --table-name users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes \
    '[{
      "IndexName": "email-index",
      "KeySchema": [{"AttributeName":"email","KeyType":"HASH"}],
      "Projection": {"ProjectionType":"ALL"},
      "ProvisionedThroughput": {"ReadCapacityUnits":5,"WriteCapacityUnits":5}
    }]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  2>&1 || echo "  (table may already exist — skipping)"

echo ""
echo "Creating 'urls' table..."
aws dynamodb create-table \
  --endpoint-url "$ENDPOINT" \
  --region "$REGION" \
  --table-name urls \
  --attribute-definitions \
    AttributeName=shortCode,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=shortCode,KeyType=HASH \
  --global-secondary-indexes \
    '[{
      "IndexName": "userId-createdAt-index",
      "KeySchema": [
        {"AttributeName":"userId","KeyType":"HASH"},
        {"AttributeName":"createdAt","KeyType":"RANGE"}
      ],
      "Projection": {"ProjectionType":"ALL"},
      "ProvisionedThroughput": {"ReadCapacityUnits":5,"WriteCapacityUnits":5}
    }]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  2>&1 || echo "  (table may already exist — skipping)"

echo ""
echo "All tables created successfully!"
aws dynamodb list-tables --endpoint-url "$ENDPOINT" --region "$REGION"
