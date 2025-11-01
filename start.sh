#!/bin/sh
# Startup script that ensures Payload initializes before serving requests

echo "🚀 Starting Payload Dashboard..."

# Set Node.js to production mode
export NODE_ENV=production

# Start the Next.js server
# Payload will automatically initialize with push:true when the server starts
# The first request to /admin will trigger initialization and table creation
exec node server.js

