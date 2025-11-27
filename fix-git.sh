#!/bin/bash

# Fix Git SSH Key on Server
# Usage: ./fix-git.sh [server-ip]

set -e

SERVER_IP=${1:-"91.98.135.191"}
SSH_USER="root"

echo "🔧 Fixing Git SSH Key on server..."

ssh $SSH_USER@$SERVER_IP << 'EOF'
    cd /opt/weclapp-manager
    
    # Backup current git config
    cp -r .git .git.backup
    
    # Remove git and re-clone with HTTPS
    rm -rf .git
    
    # Clone with HTTPS (no SSH key needed)
    git clone https://github.com/DWEBeratungGmbH/DWEapp.git temp-git
    
    # Move files and cleanup
    cp -r temp-git/.git .
    rm -rf temp-git
    
    # Reset to latest
    git reset --hard HEAD
    git clean -fd
    
    echo "✅ Git fixed with HTTPS clone"
EOF

echo "🎉 Git SSH Key issue resolved!"
