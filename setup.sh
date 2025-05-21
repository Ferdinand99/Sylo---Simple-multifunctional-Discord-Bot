#!/bin/bash

# Discord Bot Setup Script

echo "Setting up Discord Multi-Functional Bot..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file from example if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.example .env
  echo "Please edit the .env file and add your Discord bot token."
fi

# Create necessary directories if they don't exist
mkdir -p commands events features/moderation features/tickets features/reactionRoles features/stickyMessages

echo ""
echo "Setup complete! Next steps:"
echo "1. Edit the .env file and add your Discord bot token"
echo "2. Run 'npm start' to start the bot"
echo ""
echo "For development with auto-restart, use 'npm run dev'"