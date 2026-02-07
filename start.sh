#!/bin/bash

echo "========================================"
echo "  Tadasana AI Trainer - Starting..."
echo "========================================"
echo ""

echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "Starting server..."
echo "Open your browser at: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

python server.py
