
# 🎯 Audience Response System (ARS-BZ)

A comprehensive, real-time audience response system built with Next.js. Perfect for local network deployments, presentations, workshops, and interactive sessions. Think Mentimeter meets Kahoot with full local control!

## ✨ Features

### 🎪 **Core Functionality**
- **Real-time polling** with instant results
- **Multiple question types**: Multiple choice, text responses, photo uploads
- **Live session management** with unique session codes
- **Interactive dashboards** for admins and participants
- **File upload support** for rich media responses

### 👥 **User Management**
- **Role-based access**: Admin/Presenter and Participant roles
- **Flexible authentication**: Toggle between authenticated vs anonymous access
- **Session-based participation** with easy join codes

### 📊 **Analytics & Results**
- **Real-time result visualization** with charts and graphs
- **Historical session data** with persistent storage
- **Export capabilities** for session results
- **Admin controls** for result visibility (show/hide toggle)

### 🔧 **Technical Features**
- **Local network ready** - perfect for offline environments
- **Responsive design** - works on phones, tablets, laptops
- **PostgreSQL database** for reliable data storage
- **Real-time updates** using modern web technologies
- **Secure file handling** for photo submissions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/benny2744/ARS-BZ.git
   cd ARS-BZ
   ```

2. **Navigate to the app directory**
   ```bash
   cd app
   ```

3. **Install dependencies**
   ```bash
   yarn install
   ```

4. **Set up environment variables**
   Create a `.env` file in the app directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ars_database"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Optional: For production deployments
   NODE_ENV="development"
   ```

5. **Initialize the database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   yarn dev
   ```

7. **Access the application**
   - Open your browser to `http://localhost:3000`
   - For local network access, use your machine's IP: `http://192.168.1.xxx:3000`

## 📱 Usage Guide

### For Administrators/Presenters

1. **Sign in or create an account** at `/auth/signin`
2. **Access the admin dashboard** at `/admin`
3. **Create a new session** with your desired settings
4. **Add questions** of different types:
   - Multiple choice polls
   - Open text responses
   - Photo upload requests
5. **Share the session code** with participants
6. **Monitor responses** in real-time
7. **Toggle result visibility** as needed
8. **Export or review** session data later

### For Participants

1. **Visit the join page** at `/join`
2. **Enter the session code** provided by the presenter
3. **Respond to active questions** as they appear
4. **Upload photos** when requested
5. **View results** (if enabled by admin)

## 🏗️ Project Structure

```
app/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── auth/              # Authentication pages
│   ├── api/               # API routes
│   │   ├── sessions/      # Session management
│   │   ├── questions/     # Question handling
│   │   ├── responses/     # Response collection
│   │   └── upload/        # File upload handling
│   ├── dashboard/         # User dashboard
│   ├── join/              # Session join interface
│   └── session/           # Active session pages
├── components/            # Reusable UI components
├── lib/                   # Utility functions
├── prisma/                # Database schema
└── types/                 # TypeScript definitions
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components
- **Framer Motion** for animations
- **Chart.js & Recharts** for data visualization

### Backend
- **Next.js API Routes**
- **Prisma ORM** for database management
- **NextAuth.js** for authentication
- **PostgreSQL** database
- **Multer** for file uploads

### Real-time Features
- **Server-Sent Events** for live updates
- **React Query** for state management
- **SWR** for data fetching

## 🔧 Configuration

### Authentication Settings
Toggle authentication requirements in the admin panel:
- **Authenticated mode**: Requires user accounts
- **Anonymous mode**: Join with session codes only

### Network Deployment
For local network access:
1. Update `NEXTAUTH_URL` to your machine's IP address
2. Configure your firewall to allow port 3000
3. Share `http://[YOUR-IP]:3000` with participants

### Database Configuration
The system uses PostgreSQL with the following main entities:
- **Users**: Admin and participant accounts
- **Sessions**: Individual polling sessions
- **Questions**: Various question types per session  
- **Responses**: Participant answers and uploads

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Submit a pull request with a clear description

### Code Standards
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Test all new features

## 📋 API Reference

### Sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions` - List sessions
- `GET /api/sessions/[id]` - Get session details
- `PUT /api/sessions/[id]` - Update session
- `DELETE /api/sessions/[id]` - Delete session

### Questions
- `POST /api/questions` - Add question to session
- `GET /api/questions` - List questions
- `PUT /api/questions/[id]` - Update question
- `DELETE /api/questions/[id]` - Delete question

### Responses
- `POST /api/responses` - Submit response
- `GET /api/responses` - Get session responses

### File Upload
- `POST /api/upload` - Handle file uploads
- `GET /api/files/[...filename]` - Serve uploaded files

## 🔒 Security

- **Input validation** on all user inputs
- **File upload restrictions** for security
- **Session-based access control**
- **SQL injection prevention** via Prisma ORM
- **CSRF protection** built-in with NextAuth

## 🐛 Troubleshooting

### Common Issues

**Database connection errors**
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Run `npx prisma db push` to sync schema

**File upload failures**
- Check disk space in uploads directory
- Verify file permissions
- Review file size limits

**Session join issues**
- Confirm session is active
- Check network connectivity
- Verify session code accuracy

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://radix-ui.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Inspired by Mentimeter and Kahoot

## 📞 Support

For support, feature requests, or bug reports:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the API documentation

---

**Made with ❤️ for interactive presentations and audience engagement**
