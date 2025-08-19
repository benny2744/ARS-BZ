
#!/bin/bash

# Audience Response System - Linux Installer
# This script will install and configure the Audience Response System on Linux

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

# Function to detect Linux distribution
detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
        VERSION=$VERSION_ID
    elif [ -f /etc/debian_version ]; then
        DISTRO="debian"
    elif [ -f /etc/redhat-release ]; then
        DISTRO="rhel"
    else
        DISTRO="unknown"
    fi
}

# Function to install packages based on distribution
install_package() {
    case $DISTRO in
        ubuntu|debian)
            sudo apt-get update && sudo apt-get install -y "$@"
            ;;
        fedora)
            sudo dnf install -y "$@"
            ;;
        centos|rhel)
            sudo yum install -y "$@"
            ;;
        arch)
            sudo pacman -S --noconfirm "$@"
            ;;
        *)
            print_error "Unsupported distribution: $DISTRO"
            print_error "Please install the following packages manually: $@"
            exit 1
            ;;
    esac
}

# Welcome message
clear
echo "================================================================"
echo "    AUDIENCE RESPONSE SYSTEM - LINUX INSTALLER"
echo "================================================================"
echo ""
echo "This installer will set up the Audience Response System on your"
echo "Linux computer. The installation process will:"
echo ""
echo "1. Detect your Linux distribution"
echo "2. Install required dependencies (Node.js, Git, PostgreSQL)"
echo "3. Download the application"
echo "4. Set up the database"
echo "5. Configure the environment"
echo "6. Build and prepare the application"
echo ""
echo "Installation location: $HOME/AudienceResponseSystem"
echo ""
read -p "Press Enter to continue or Ctrl+C to exit..."

# Detect distribution
detect_distro
print_status "Detected distribution: $DISTRO"

# Check if running with appropriate permissions
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. This is not recommended."
    print_warning "The application will be installed for the root user."
fi

# Set installation directory
INSTALL_DIR="$HOME/AudienceResponseSystem"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

print_status "[1/8] Checking system requirements..."

# Update package manager
case $DISTRO in
    ubuntu|debian)
        print_status "Updating package lists..."
        sudo apt-get update
        ;;
    fedora)
        print_status "Updating package lists..."
        sudo dnf update -y
        ;;
    centos|rhel)
        print_status "Updating package lists..."
        sudo yum update -y
        ;;
esac

# Install basic dependencies
print_status "[2/8] Installing basic dependencies..."
case $DISTRO in
    ubuntu|debian)
        install_package curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
        ;;
    fedora)
        install_package curl wget gnupg2
        ;;
    centos|rhel)
        install_package curl wget gnupg2 epel-release
        ;;
    arch)
        install_package curl wget gnupg
        ;;
esac

# Install Node.js
print_status "[3/8] Installing Node.js..."
if ! command_exists node || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
    case $DISTRO in
        ubuntu|debian)
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            install_package nodejs
            ;;
        fedora)
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            install_package nodejs
            ;;
        centos|rhel)
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            install_package nodejs
            ;;
        arch)
            install_package nodejs npm
            ;;
    esac
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js found: $(node --version)"
fi

# Install Git
print_status "[4/8] Installing Git..."
if ! command_exists git; then
    install_package git
    print_success "Git installed: $(git --version)"
else
    print_success "Git found: $(git --version)"
fi

# Install PostgreSQL
print_status "[5/8] Installing PostgreSQL..."
if ! command_exists psql; then
    case $DISTRO in
        ubuntu|debian)
            install_package postgresql postgresql-contrib
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            ;;
        fedora)
            install_package postgresql postgresql-server postgresql-contrib
            sudo postgresql-setup --initdb
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            ;;
        centos|rhel)
            install_package postgresql postgresql-server postgresql-contrib
            sudo postgresql-setup initdb
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            ;;
        arch)
            install_package postgresql
            sudo -u postgres initdb --locale en_US.UTF-8 -D '/var/lib/postgres/data'
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            ;;
    esac
    
    # Create database user
    print_status "Setting up PostgreSQL user..."
    sudo -u postgres createuser -s "$USER" 2>/dev/null || true
    
    print_success "PostgreSQL installed and configured!"
else
    print_success "PostgreSQL found"
    sudo systemctl start postgresql 2>/dev/null || true
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

# Install application dependencies
print_status "[7/8] Installing application dependencies..."
cd app

# Install Yarn
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
DATABASE_URL="postgresql://$USER@localhost:5432/ars_database"

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

# Create systemd service (optional)
print_status "Creating systemd service..."
mkdir -p "$HOME/.config/systemd/user"
cat > "$HOME/.config/systemd/user/audience-response-system.service" << EOF
[Unit]
Description=Audience Response System
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR/ARS-BZ/app
ExecStart=/usr/bin/yarn start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload

# Create desktop entry
print_status "Creating desktop entry..."
mkdir -p "$HOME/.local/share/applications"
cat > "$HOME/.local/share/applications/audience-response-system.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Audience Response System
Comment=Interactive audience response and polling system
Exec=$INSTALL_DIR/start-ars.sh
Icon=applications-internet
Terminal=true
Categories=Network;Education;
StartupNotify=true
EOF

# Copy to desktop if it exists
if [ -d "$HOME/Desktop" ]; then
    cp "$HOME/.local/share/applications/audience-response-system.desktop" "$HOME/Desktop/"
    chmod +x "$HOME/Desktop/audience-response-system.desktop"
fi

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
print_success "2. Run: $INSTALL_DIR/start-ars.sh, OR"
print_success "3. Start as service: systemctl --user start audience-response-system"
print_success ""
print_success "The application will be available at: http://localhost:3000"
print_success ""
print_success "SYSTEMD SERVICE COMMANDS:"
print_success "- Start: systemctl --user start audience-response-system"
print_success "- Stop: systemctl --user stop audience-response-system"
print_success "- Enable auto-start: systemctl --user enable audience-response-system"
print_success ""
print_success "IMPORTANT NOTES:"
print_success "- Change the NEXTAUTH_SECRET in .env file for production use"
print_success "- Configure firewall to allow port 3000 if needed"
print_success ""
print_success "For network access from other devices:"
print_success "- Use your computer's IP address instead of localhost"
print_success "- Example: http://192.168.1.100:3000"
print_success "- Configure firewall: sudo ufw allow 3000"
print_success ""
print_success "Need help? Check the README.md file or visit:"
print_success "https://github.com/benny2744/ARS-BZ"
print_success ""

read -p "Would you like to start the application now? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting Audience Response System..."
    if command_exists gnome-terminal; then
        gnome-terminal -- bash -c "$INSTALL_DIR/start-ars.sh"
    elif command_exists konsole; then
        konsole -e bash -c "$INSTALL_DIR/start-ars.sh"
    elif command_exists xterm; then
        xterm -e bash -c "$INSTALL_DIR/start-ars.sh"
    else
        print_status "Please run: $INSTALL_DIR/start-ars.sh"
    fi
fi

print_success "Installation script completed!"
