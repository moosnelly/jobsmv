#!/bin/bash

# Build script for Docker containers
# Usage: ./infra/scripts/build.sh

set -e

echo "Building Docker containers..."

# Change to the project root directory (parent of infra)
cd "$(dirname "$0")/.."

# Build all services
docker compose -f infra/docker-compose.yml build

echo "Build completed successfully!"
