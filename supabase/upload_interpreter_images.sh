#!/bin/bash

# Script to upload interpreter images to Supabase Storage
# This script assumes you have the Supabase CLI installed and configured

echo "Uploading interpreter images to Supabase Storage..."

# Set your Supabase project URL and anon key
# Replace these with your actual values
SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

# Path to the assets directory
ASSETS_DIR="../assets"

# Upload each interpreter image
echo "Uploading jung.png..."
curl -X POST "${SUPABASE_URL}/storage/v1/object/interpreters/jung.png" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: image/png" \
  --data-binary "@${ASSETS_DIR}/jung.png"

echo "Uploading freud.png..."
curl -X POST "${SUPABASE_URL}/storage/v1/object/interpreters/freud.png" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: image/png" \
  --data-binary "@${ASSETS_DIR}/freud.png"

echo "Uploading lakshmi.png..."
curl -X POST "${SUPABASE_URL}/storage/v1/object/interpreters/lakshmi.png" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: image/png" \
  --data-binary "@${ASSETS_DIR}/lakshmi.png"

echo "Uploading mary.png..."
curl -X POST "${SUPABASE_URL}/storage/v1/object/interpreters/mary.png" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: image/png" \
  --data-binary "@${ASSETS_DIR}/mary.png"

echo "Upload complete!"

# Alternative: Using Supabase CLI (if installed)
# Uncomment the following lines and comment out the curl commands above

# supabase storage upload interpreters/jung.png ${ASSETS_DIR}/jung.png
# supabase storage upload interpreters/freud.png ${ASSETS_DIR}/freud.png
# supabase storage upload interpreters/lakshmi.png ${ASSETS_DIR}/lakshmi.png
# supabase storage upload interpreters/mary.png ${ASSETS_DIR}/mary.png