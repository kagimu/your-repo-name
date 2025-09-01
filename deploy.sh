#!/bin/bash

# Install dependencies
npm ci

# Clear cache
npm cache clean --force

# Build the project
NODE_ENV=production npm run build

# Optionally verify the build
npm run preview
