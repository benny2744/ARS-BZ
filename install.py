
#!/usr/bin/env python3
"""
Audience Response System - Cross-Platform GUI Installer
A user-friendly GUI installer for Windows, macOS, and Linux
"""

import os
import sys
import platform
import subprocess
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import threading
import requests
import zipfile
import json
import shutil
from pathlib import Path
import webbrowser

class ARSInstaller:
    def __init__(self):
        self.system = platform.system()
        self.root = tk.Tk()
        self.root.title("Audience Response System Installer")
        self.root.geometry("800x600")
        self.root.resizable(True, True)
        
        # Installation variables
        self.install_dir = self.get_default_install_dir()
        self.progress_var = tk.DoubleVar()
        self.status_var = tk.StringVar(value="Ready to install")
        
        # Create GUI
        self.create_gui()
        
    def get_default_install_dir(self):
        """Get default installation directory based on OS"""
        home = Path.home()
        if self.system == "Windows":
            return home / "AudienceResponseSystem"
        else:
            return home / "AudienceResponseSystem"
    
    def create_gui(self):
        """Create the main GUI"""
        # Main frame
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        
        # Title
        title_label = ttk.Label(main_frame, text="Audience Response System Installer", 
                               font=("Arial", 16, "bold"))
        title_label.grid(row=0, column=0, columnspan=2, pady=(0, 20))
        
        # System info
        system_label = ttk.Label(main_frame, text=f"Detected System: {self.system} {platform.release()}")
        system_label.grid(row=1, column=0, columnspan=2, pady=(0, 10))
        
        # Installation directory
        ttk.Label(main_frame, text="Installation Directory:").grid(row=2, column=0, sticky=tk.W, pady=5)
        
        dir_frame = ttk.Frame(main_frame)
        dir_frame.grid(row=2, column=1, sticky=(tk.W, tk.E), pady=5)
        dir_frame.columnconfigure(0, weight=1)
        
        self.dir_entry = ttk.Entry(dir_frame, width=50)
        self.dir_entry.grid(row=0, column=0, sticky=(tk.W, tk.E), padx=(0, 5))
        self.dir_entry.insert(0, str(self.install_dir))
        
        ttk.Button(dir_frame, text="Browse", command=self.browse_directory).grid(row=0, column=1)
        
        # Options frame
        options_frame = ttk.LabelFrame(main_frame, text="Installation Options", padding="10")
        options_frame.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=20)
        
        self.install_deps = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="Install dependencies (Node.js, PostgreSQL, Git)", 
                       variable=self.install_deps).grid(row=0, column=0, sticky=tk.W)
        
        self.create_shortcuts = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="Create desktop shortcuts", 
                       variable=self.create_shortcuts).grid(row=1, column=0, sticky=tk.W)
        
        self.start_after_install = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="Start application after installation", 
                       variable=self.start_after_install).grid(row=2, column=0, sticky=tk.W)
        
        # Progress frame
        progress_frame = ttk.LabelFrame(main_frame, text="Installation Progress", padding="10")
        progress_frame.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=20)
        progress_frame.columnconfigure(0, weight=1)
        
        self.progress_bar = ttk.Progressbar(progress_frame, variable=self.progress_var, maximum=100)
        self.progress_bar.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 5))
        
        self.status_label = ttk.Label(progress_frame, textvariable=self.status_var)
        self.status_label.grid(row=1, column=0, sticky=tk.W)
        
        # Log frame
        log_frame = ttk.LabelFrame(main_frame, text="Installation Log", padding="10")
        log_frame.grid(row=5, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=20)
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)
        
        self.log_text = scrolledtext.ScrolledText(log_frame, width=70, height=15)
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Buttons frame
        buttons_frame = ttk.Frame(main_frame)
        buttons_frame.grid(row=6, column=0, columnspan=2, pady=20)
        
        self.install_button = ttk.Button(buttons_frame, text="Install", command=self.start_installation)
        self.install_button.grid(row=0, column=0, padx=5)
        
        self.cancel_button = ttk.Button(buttons_frame, text="Cancel", command=self.cancel_installation)
        self.cancel_button.grid(row=0, column=1, padx=5)
        
        ttk.Button(buttons_frame, text="Help", command=self.show_help).grid(row=0, column=2, padx=5)
        
        # Configure row weights for main frame
        main_frame.rowconfigure(5, weight=1)
        
    def log(self, message):
        """Add message to log"""
        self.log_text.insert(tk.END, f"{message}\n")
        self.log_text.see(tk.END)
        self.root.update()
        
    def update_status(self, message, progress=None):
        """Update status and progress"""
        self.status_var.set(message)
        if progress is not None:
            self.progress_var.set(progress)
        self.log(message)
        
    def browse_directory(self):
        """Browse for installation directory"""
        from tkinter import filedialog
        directory = filedialog.askdirectory(initialdir=self.dir_entry.get())
        if directory:
            self.dir_entry.delete(0, tk.END)
            self.dir_entry.insert(0, directory)
            
    def start_installation(self):
        """Start installation in separate thread"""
        self.install_button.config(state='disabled')
        self.install_dir = Path(self.dir_entry.get())
        
        # Start installation in thread
        install_thread = threading.Thread(target=self.run_installation)
        install_thread.daemon = True
        install_thread.start()
        
    def run_installation(self):
        """Run the installation process"""
        try:
            self.update_status("Starting installation...", 0)
            
            # Create installation directory
            self.install_dir.mkdir(parents=True, exist_ok=True)
            self.update_status(f"Created installation directory: {self.install_dir}", 5)
            
            if self.install_deps.get():
                self.install_dependencies()
                
            self.download_application()
            self.setup_database()
            self.build_application()
            
            if self.create_shortcuts.get():
                self.create_desktop_shortcuts()
                
            self.update_status("Installation completed successfully!", 100)
            
            if self.start_after_install.get():
                self.start_application()
                
            messagebox.showinfo("Success", "Installation completed successfully!\n\nThe application is ready to use.")
            
        except Exception as e:
            self.log(f"ERROR: {str(e)}")
            messagebox.showerror("Installation Error", f"Installation failed: {str(e)}")
        finally:
            self.install_button.config(state='normal')
            
    def install_dependencies(self):
        """Install system dependencies"""
        self.update_status("Installing dependencies...", 10)
        
        if self.system == "Windows":
            self.install_windows_dependencies()
        elif self.system == "Darwin":  # macOS
            self.install_mac_dependencies()
        else:  # Linux
            self.install_linux_dependencies()
            
        self.update_status("Dependencies installed", 30)
        
    def install_windows_dependencies(self):
        """Install Windows dependencies"""
        # Check for Node.js
        if not self.check_command("node"):
            self.log("Installing Node.js...")
            # Download and install Node.js (simplified - in real implementation, use proper installer)
            messagebox.showinfo("Manual Installation Required", 
                              "Please install Node.js from https://nodejs.org before continuing.")
            
        # Check for Git
        if not self.check_command("git"):
            self.log("Installing Git...")
            messagebox.showinfo("Manual Installation Required", 
                              "Please install Git from https://git-scm.com before continuing.")
                              
        # PostgreSQL would be handled similarly
        
    def install_mac_dependencies(self):
        """Install macOS dependencies using Homebrew"""
        # Check for Homebrew
        if not self.check_command("brew"):
            self.log("Installing Homebrew...")
            self.run_command('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"')
            
        # Install dependencies
        dependencies = ["node", "git", "postgresql@14"]
        for dep in dependencies:
            if not self.check_command(dep.split('@')[0]):
                self.log(f"Installing {dep}...")
                self.run_command(f"brew install {dep}")
                
    def install_linux_dependencies(self):
        """Install Linux dependencies"""
        # Detect package manager
        if self.check_command("apt-get"):
            self.run_command("sudo apt-get update")
            self.run_command("sudo apt-get install -y nodejs npm git postgresql postgresql-contrib")
        elif self.check_command("yum"):
            self.run_command("sudo yum install -y nodejs npm git postgresql postgresql-server")
        elif self.check_command("dnf"):
            self.run_command("sudo dnf install -y nodejs npm git postgresql postgresql-server")
        else:
            messagebox.showwarning("Package Manager", 
                                 "Could not detect package manager. Please install dependencies manually.")
                                 
    def download_application(self):
        """Download the application"""
        self.update_status("Downloading application...", 40)
        
        app_dir = self.install_dir / "ARS-BZ"
        
        if self.check_command("git"):
            # Clone using Git
            self.log("Cloning repository...")
            if app_dir.exists():
                self.run_command(f"cd {app_dir} && git pull origin main")
            else:
                self.run_command(f"git clone https://github.com/benny2744/ARS-BZ.git {app_dir}")
        else:
            # Download ZIP
            self.log("Downloading ZIP file...")
            self.download_zip()
            
        self.update_status("Application downloaded", 50)
        
    def download_zip(self):
        """Download application as ZIP file"""
        url = "https://github.com/benny2744/ARS-BZ/archive/main.zip"
        zip_path = self.install_dir / "ars-main.zip"
        
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(zip_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        # Extract ZIP
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(self.install_dir)
            
        # Rename extracted folder
        extracted_dir = self.install_dir / "ARS-BZ-main"
        app_dir = self.install_dir / "ARS-BZ"
        
        if extracted_dir.exists():
            if app_dir.exists():
                shutil.rmtree(app_dir)
            extracted_dir.rename(app_dir)
            
        # Clean up
        zip_path.unlink()
        
    def setup_database(self):
        """Set up the database"""
        self.update_status("Setting up database...", 60)
        
        app_dir = self.install_dir / "ARS-BZ" / "app"
        os.chdir(app_dir)
        
        # Install dependencies
        self.log("Installing Node.js dependencies...")
        self.run_command("npm install -g yarn")
        self.run_command("yarn install")
        
        # Create .env file
        env_content = """# Database Configuration
DATABASE_URL="postgresql://postgres@localhost:5432/ars_database"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-key-here-change-this-in-production"

# Environment
NODE_ENV="production"

# File Upload Settings
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
"""
        
        with open(app_dir / ".env", "w") as f:
            f.write(env_content)
            
        # Setup database
        self.log("Initializing database...")
        try:
            self.run_command("createdb ars_database")
        except:
            pass  # Database might already exist
            
        self.run_command("npx prisma migrate deploy")
        self.run_command("npx prisma db seed")
        
        self.update_status("Database configured", 80)
        
    def build_application(self):
        """Build the application"""
        self.update_status("Building application...", 90)
        
        app_dir = self.install_dir / "ARS-BZ" / "app"
        os.chdir(app_dir)
        
        self.run_command("yarn build")
        self.update_status("Application built", 95)
        
    def create_desktop_shortcuts(self):
        """Create desktop shortcuts"""
        self.update_status("Creating shortcuts...", 98)
        
        if self.system == "Windows":
            self.create_windows_shortcut()
        elif self.system == "Darwin":
            self.create_mac_shortcut()
        else:
            self.create_linux_shortcut()
            
    def create_windows_shortcut(self):
        """Create Windows shortcut"""
        # This would create a .lnk file on Windows
        pass
        
    def create_mac_shortcut(self):
        """Create macOS app bundle"""
        # This would create an .app bundle on macOS
        pass
        
    def create_linux_shortcut(self):
        """Create Linux desktop entry"""
        desktop_dir = Path.home() / "Desktop"
        if desktop_dir.exists():
            desktop_file = desktop_dir / "Audience Response System.desktop"
            content = f"""[Desktop Entry]
Version=1.0
Type=Application
Name=Audience Response System
Comment=Interactive audience response system
Exec={self.install_dir}/start-ars.sh
Terminal=true
Categories=Network;Education;
"""
            with open(desktop_file, "w") as f:
                f.write(content)
            os.chmod(desktop_file, 0o755)
            
    def start_application(self):
        """Start the application"""
        self.log("Starting application...")
        app_dir = self.install_dir / "ARS-BZ" / "app"
        
        if self.system == "Windows":
            subprocess.Popen(["cmd", "/c", "yarn start"], cwd=app_dir, shell=True)
        else:
            subprocess.Popen(["yarn", "start"], cwd=app_dir)
            
        # Open browser
        webbrowser.open("http://localhost:3000")
        
    def check_command(self, command):
        """Check if command exists"""
        try:
            subprocess.run([command, "--version"], capture_output=True, check=True)
            return True
        except:
            return False
            
    def run_command(self, command):
        """Run shell command"""
        self.log(f"Running: {command}")
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        
        if result.stdout:
            self.log(f"Output: {result.stdout}")
        if result.stderr:
            self.log(f"Error: {result.stderr}")
            
        if result.returncode != 0:
            raise Exception(f"Command failed: {command}")
            
        return result
        
    def cancel_installation(self):
        """Cancel installation"""
        if messagebox.askquestion("Cancel", "Are you sure you want to cancel the installation?") == "yes":
            self.root.quit()
            
    def show_help(self):
        """Show help information"""
        help_text = """Audience Response System Installer Help

This installer will set up the Audience Response System on your computer.

REQUIREMENTS:
- Internet connection for downloading components
- Administrator privileges (Windows/Linux)
- At least 1GB free disk space

INSTALLATION PROCESS:
1. Install system dependencies (Node.js, PostgreSQL, Git)
2. Download the application from GitHub
3. Set up the database
4. Build and configure the application
5. Create desktop shortcuts (optional)

TROUBLESHOOTING:
- Make sure you have an active internet connection
- On Linux, you may need to install dependencies manually
- Check the installation log for detailed error messages

For more help, visit: https://github.com/benny2744/ARS-BZ
"""
        
        help_window = tk.Toplevel(self.root)
        help_window.title("Help")
        help_window.geometry("600x400")
        
        text_widget = scrolledtext.ScrolledText(help_window, wrap=tk.WORD, padx=10, pady=10)
        text_widget.pack(fill=tk.BOTH, expand=True)
        text_widget.insert(tk.END, help_text)
        text_widget.config(state=tk.DISABLED)

def main():
    """Main function"""
    try:
        # Check if GUI libraries are available
        import tkinter as tk
        
        app = ARSInstaller()
        app.root.mainloop()
        
    except ImportError:
        print("GUI libraries not available. Please install tkinter.")
        print("On Ubuntu/Debian: sudo apt-get install python3-tk")
        print("On CentOS/RHEL: sudo yum install tkinter")
        sys.exit(1)
    except Exception as e:
        print(f"Error starting installer: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
