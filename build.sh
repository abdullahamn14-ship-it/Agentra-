#!/bin/bash

# Install Flutter on Netlify
echo "📦 Installing Flutter..."

# Download Flutter SDK
cd /opt/buildhome
git clone https://github.com/flutter/flutter.git -b stable --depth 1

# Add Flutter to PATH
export PATH="$PATH:/opt/buildhome/flutter/bin"

# Run Flutter doctor
flutter doctor -v

# Enable web support
flutter config --enable-web

# Navigate back to repo
cd /opt/build/repo

# Get dependencies
echo "📦 Getting dependencies..."
flutter pub get

# Build web app
echo "🔨 Building web app..."
flutter build web --release --web-renderer html

echo "✅ Build complete!"
