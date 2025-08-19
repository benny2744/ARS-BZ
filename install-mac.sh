
#!/bin/bash

# Audience Response System - macOS Installer
# This script will install and configure the Audience Response System on macOS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Welcome message
clear
echo "================================================================"
echo "    AUDIENCE RESPONSE SYSTEM - macOS INSTALLER"
echo "================================================================"
echo ""
echo "This installer will set up the Audience Response System on your"
echo "macOS computer. The installation process will:"
echo ""
echo "1. Install required dependencies (Node.js, Git, PostgreSQL)"
echo "2. Download the application"
echo "3. Set up the database"
echo "4. Configure the environment"
echo "5. Build and prepare the application"
echo ""
echo "Installation location: $HOME/AudienceResponseSystem"
echo ""
read -p "Press Enter to continue or Ctrl+C to exit..."

# Set installation directory
INSTALL_DIR="$HOME/AudienceResponseSystem"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

print_status "[1/8] Checking system requirements..."

# Check for Homebrew and install if needed
print_status "[2/8] Checking for Homebrew..."
if ! command_exists brew; then
    print_warning "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
    
    print_success "Homebrew installed successfully!"
else
    print_success "Homebrew found: $(brew --version | head -n1)"
fi

# Check for Node.js and install if needed
print_status "[3/8] Checking for Node.js..."
if ! command_exists node || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
    print_warning "Node.js 18+ not found. Installing Node.js..."
    brew install node
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js found: $(node --version)"
fi

# Check for Git and install if needed
print_status "[4/8] Checking for Git..."
if ! command_exists git; then
    print_warning "Git not found. Installing Git..."
    brew install git
    print_success "Git installed: $(git --version)"
else
    print_success "Git found: $(git --version)"
fi

# Check for PostgreSQL and install if needed
print_status "[5/8] Setting up PostgreSQL..."
if ! command_exists psql; then
    print_warning "PostgreSQL not found. Installing PostgreSQL..."
    brew install postgresql@14
    brew services start postgresql@14
    
    # Add PostgreSQL to PATH
    echo 'export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"' >> ~/.zprofile
    export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"
    
    print_success "PostgreSQL installed and started!"
    
    # Create database user
    sleep 5
    createuser -s postgres 2>/dev/null || true
    
else
    print_success "PostgreSQL found"
    # Make sure PostgreSQL is running
    brew services start postgresql@14 2>/dev/null || true
fi

# Download the application
print_status "[6/8] Downloading Audience Response System..."
if [ -d "ARS-BZ" ]; then
    print_status "Updating existing installation..."
    cd ARS-BZ
    git pull origin main
else
    print_status "Cloning from GitHub..."
    git clone https://github.com/benny2744/ARS-BZ.git
    cd ARS-BZ
fi

# Install dependencies
print_status "[7/8] Installing application dependencies..."
cd app

# Install Yarn if not present
if ! command_exists yarn; then
    npm install -g yarn
fi

yarn install

# Set up database and configuration
print_status "[8/8] Setting up database and configuration..."

# Create database
createdb ars_database 2>/dev/null || true

# Create .env file
print_status "Creating configuration file..."
cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://postgres@localhost:5432/ars_database"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-key-here-change-this-in-production"

# Environment
NODE_ENV="production"

# File Upload Settings
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
EOF

# Initialize database
print_status "Initializing database..."
npx prisma migrate deploy
npx prisma db seed

# Build application
print_status "Building application..."
yarn build

# Create startup script
print_status "Creating startup script..."
cd "$INSTALL_DIR"
cat > "start-ars.sh" << 'EOF'
#!/bin/bash

# Audience Response System Startup Script

echo "Starting Audience Response System..."
echo ""

# Navigate to application directory
cd "$HOME/AudienceResponseSystem/ARS-BZ/app"

# Start the application
echo "Application starting at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

yarn start
EOF

chmod +x start-ars.sh

# Create macOS app bundle
print_status "Creating macOS application..."
mkdir -p "Audience Response System.app/Contents/MacOS"
mkdir -p "Audience Response System.app/Contents/Resources"

cat > "Audience Response System.app/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>start-ars</string>
    <key>CFBundleIdentifier</key>
    <string>com.ars.audienceresponse</string>
    <key>CFBundleName</key>
    <string>Audience Response System</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
</dict>
</plist>
EOF

cat > "Audience Response System.app/Contents/MacOS/start-ars" << 'EOF'
#!/bin/bash
osascript -e 'tell application "Terminal" to do script "cd '$HOME'/AudienceResponseSystem && ./start-ars.sh"'
EOF

chmod +x "Audience Response System.app/Contents/MacOS/start-ars"

# Create desktop alias
print_status "Creating desktop shortcut..."
ln -sf "$INSTALL_DIR/Audience Response System.app" "$HOME/Desktop/Audience Response System.app" 2>/dev/null || true

print_success ""
print_success "================================================================"
print_success "                    INSTALLATION COMPLETED!"
print_success "================================================================"
print_success ""
print_success "The Audience Response System has been successfully installed!"
print_success ""
print_success "Installation location: $INSTALL_DIR"
print_success ""
print_success "HOW TO START:"
print_success "1. Double-click 'Audience Response System' on your desktop, OR"
print_success "2. Run: $INSTALL_DIR/start-ars.sh"
print_success ""
print_success "The application will be available at: http://localhost:3000"
print_success ""
print_success "IMPORTANT NOTES:"
print_success "- Change the NEXTAUTH_SECRET in .env file for production use"
print_success "- Make sure macOS Firewall allows the application"
print_success ""
print_success "For network access from other devices:"
print_success "- Use your Mac's IP address instead of localhost"
print_success "- Example: http://192.168.1.100:3000"
print_success ""
print_success "Need help? Check the README.md file or visit:"
print_success "https://github.com/benny2744/ARS-BZ"
print_success ""

read -p "Would you like to start the application now? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting Audience Response System..."
    open "$INSTALL_DIR/Audience Response System.app"
fi

print_success "Installation script completed!"
