#!/bin/sh
set -eu

PRODUCT_API_URL="${PRODUCT_API_URL:-http://localhost:5000}"
ORDER_API_URL="${ORDER_API_URL:-http://localhost:5001}"

sed -i "s|__PRODUCT_API_URL__|$PRODUCT_API_URL|g" /usr/share/nginx/html/env.js
sed -i "s|__ORDER_API_URL__|$ORDER_API_URL|g" /usr/share/nginx/html/env.js

exec nginx -g "daemon off;"