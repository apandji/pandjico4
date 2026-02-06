#!/bin/bash
# Simple script to start the local development server

PORT=8000
DIR="/Users/apandji/Documents/pandjico4"

# Kill any existing server on this port
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

# Start the server
cd "$DIR"
echo "Starting server on http://localhost:$PORT"
python3 -m http.server $PORT
