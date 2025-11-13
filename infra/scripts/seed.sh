#!/bin/bash

# Seed script for populating sample data
# Usage: ./infra/scripts/seed.sh

set -e

echo "Seeding database..."

docker compose -f infra/docker-compose.yml exec -T api python -m app.scripts.seed

echo "Database seeded successfully!"

