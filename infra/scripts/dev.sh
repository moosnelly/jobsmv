#!/bin/bash

# Development helper script
# Usage: ./infra/scripts/dev.sh

set -e

echo "Starting development environment..."

docker compose -f infra/docker-compose.yml up --build

