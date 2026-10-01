#!/usr/bin/env bash
# Cadence Local Docker Runner for Linux & macOS
set -e

TOPOLOGY=${1:-"combined"}

echo "=========================================================="
echo "    Cadence AI - Local Engine Docker Launcher"
echo "=========================================================="
echo "Topology selected: $TOPOLOGY"

# Hardware detection
if command -v nvidia-smi &> /dev/null; then
    echo "--> Detected NVIDIA GPU with CUDA acceleration."
    COMPOSE_FILE="docker/docker-compose.$TOPOLOGY.yml"
    docker compose -f "$COMPOSE_FILE" up --build
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "--> Detected macOS (Apple Silicon / MPS mode)."
    COMPOSE_FILE="docker/docker-compose.$TOPOLOGY.yml"
    OVERRIDE_FILE="docker/docker-compose.override.macbook.yml"
    docker compose -f "$COMPOSE_FILE" -f "$OVERRIDE_FILE" up --build
else
    echo "--> Running in standard mode."
    COMPOSE_FILE="docker/docker-compose.$TOPOLOGY.yml"
    docker compose -f "$COMPOSE_FILE" up --build
fi
