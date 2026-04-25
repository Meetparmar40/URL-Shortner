#!/bin/bash
echo "==================================================="
echo "    Starting URL Shortener via Docker..."
echo "==================================================="
echo ""
echo "Step 1: Downloading configuration..."
curl -s -O https://raw.githubusercontent.com/Meetparmar40/URL-Shortner/main/docker-compose.hub.yml

echo ""
echo "Step 2: Starting containers..."
docker compose -f docker-compose.hub.yml up --pull always -d

echo ""
echo "==================================================="
echo "  SUCCESS! The app is starting up."
echo "  It might take ~10 seconds for DynamoDB to initialize."
echo ""
echo "  Open your browser and go to: http://localhost:5005"
echo "==================================================="
