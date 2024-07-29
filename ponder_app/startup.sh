#!/bin/sh

if [ -n "$GOOGLE_APPLICATION_CREDENTIALS_BASE64" ]; then
    echo $GOOGLE_APPLICATION_CREDENTIALS_BASE64 | base64 -d > /app/google-credentials.json
    export GOOGLE_APPLICATION_CREDENTIALS=/app/google-credentials.json
fi

if [ "$MODE" = "server" ]; then
    npm run serve
else
    npm run start
fi