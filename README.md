# 🔐 Digital Document Locker System

A secure, full-stack web application for managing and storing personal documents digitally. Built with MERN stack (MongoDB, Express.js, React.js, Node.js) featuring OTP-based authentication, document categorization, and secure document sharing capabilities.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Installation & Setup](#-installation--setup)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Usage Guide](#-usage-guide)
- [Security Features](#-security-features)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Functionality
- 🔒 **Secure Authentication**: OTP-based email verification with JWT tokens
- 📁 **Document Management**: Upload, view, download, and delete documents
- 🏷️ **Smart Categorization**: Organize documents into 5 categories (Education, Identity, Health, Railway, Others)
- 🔗 **Secure Sharing**: Generate time-limited shareable links for documents
- 👤 **User Profile**: Manage personal information and account details
- 📊 **Dashboard**: Visual statistics and recent document overview
- 📱 **Responsive Design**: Mobile-friendly interface using Tailwind CSS

### Security Features
- Password hashing using bcryptjs
- JWT-based session management
- Protected routes with authentication middleware
- Secure file storage with Base64 encoding
- Time-limited document sharing tokens
- Input validation and sanitization

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI framework
- **React Router DOM 6.20** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **React Toastify** - Toast notifications
- **Vite 5.0** - Build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express.js 4.18** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8.0** - ODM for MongoDB
- **JWT (jsonwebtoken 9.0)** - Authentication tokens
- **bcryptjs 2.4** - Password hashing
- **Multer 1.4** - File upload handling
- **Winston 3.11** - Logging framework
- **Nodemailer 6.9** - Email service

## 🏗️ System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   React Client  │────────▶│  Express API    │────────▶│   MongoDB       │
│   (Frontend)    │◀────────│   (Backend)     │◀────────│   (Database)    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
      Port 5173                   Port 5000                  Port 27017
```

### Data Flow
1. User interacts with React frontend
2. Axios sends HTTP requests to Express API
3. Express validates JWT tokens via middleware
4. Controllers process business logic
5. Mongoose models interact with MongoDB
6. Response sent back through the chain

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git
- Gmail account (for OTP emails)

### Step 1: Clone Repository
```bash
git clone https://github.com/Akash79665/Secure-_-Share-Govt-Document.git
cd digital-document-locker
```

### Step 2: Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

**Configure .env file:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/digital-locker
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
LOG_LEVEL=info
```

**Get Gmail App Password:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate password for "Mail"
5. Copy 16-character password to .env

**Start MongoDB:**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**Start Backend Server:**
```bash
npm run dev
# Server runs on http://localhost:5000
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start frontend
npm run dev
# Application runs on http://localhost:5173
```

### Step 4: Verify Installation
1. Open http://localhost:5173
2. Backend health check: http://localhost:5000/health
3. Create test account and verify OTP functionality

## 📂 Project Structure

```
digital-document-locker/
│
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── logger.js             # Winston logger setup
│   │
│   ├── controllers/
│   │   ├── auth.controller.js    # Authentication logic
│   │   ├── document.controller.js # Document operations
│   │   └── user.controller.js    # User management
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verification
│   │   ├── error.middleware.js   # Error handling
│   │   └── upload.middleware.js  # File upload handling
│   │
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Document.js           # Document schema
│   │
│   ├── routes/
│   │   ├── auth.routes.js        # Auth endpoints
│   │   ├── document.routes.js    # Document endpoints
│   │   └── user.routes.js        # User endpoints
│   │
│   ├── utils/
│   │   ├── email.util.js         # Email sending
│   │   └── otp.util.js           # OTP generation
│   │
│   ├── .env                      # Environment variables
│   ├── package.json              # Dependencies
│   └── server.js                 # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── VerifyOTP.jsx
│   │   │   │
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── DocumentList.jsx
│   │   │   │   ├── UploadDoc.jsx
│   │   │   │   ├── ShareDoc.jsx
│   │   │   │   └── SharedDocument.jsx
│   │   │   │
│   │   │   ├── Profile/
│   │   │   │   └── MyProfile.jsx
│   │   │   │
│   │   │   └── Common/
│   │   │       ├── Navbar.jsx
│   │   │       └── ProtectedRoute.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   │
│   │   ├── utils/
│   │   │   └── validators.js     # Form validation
│   │   │
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # Entry point
│   │
│   ├── .env                      # Environment variables
│   ├── package.json              # Dependencies
│   ├── tailwind.config.js        # Tailwind configuration
│   └── vite.config.js            # Vite configuration
│
└── README.md                     # This file
```

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "aadhaarNumber": "123456789012",
  "phone": "9876543210"
}

Response: 201 Created
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "...",
    "email": "john@example.com"
  }
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}

Response: 200 OK
{
  "success": true,
  "message": "Account verified successfully",
  "data": {
    "token": "jwt_token_here",
    "user": { ... }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": { ... }
  }
}
```

### Document Endpoints

#### Upload Document
```http
POST /api/documents/upload
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Degree Certificate",
  "category": "education",
  "description": "Bachelor's Degree",
  "fileName": "degree.pdf",
  "fileType": "application/pdf",
  "fileSize": 102400,
  "fileData": "base64_encoded_string"
}

Response: 201 Created
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": { ... }
}
```

#### Get All Documents
```http
GET /api/documents
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

#### Get Document by ID
```http
GET /api/documents/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

#### Share Document
```http
POST /api/documents/:id/share
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "recipient@example.com",
  "expiryHours": 24
}

Response: 200 OK
{
  "success": true,
  "message": "Document shared successfully",
  "data": {
    "shareLink": "http://localhost:5173/shared/{token}"
  }
}
```

#### Delete Document
```http
DELETE /api/documents/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### User Endpoints

#### Get Current User Profile
```http
GET /api/users/profile
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

## 📖 Usage Guide

### For Users

1. **Registration**
   - Visit the registration page
   - Fill in required details (Name, Email, Password, Aadhaar, Phone)
   - Use OTP `123456` for testing (check backend console for OTP)
   - Verify your account

2. **Login**
   - Enter registered email and password
   - Access your dashboard upon successful login

3. **Upload Documents**
   - Navigate to "Upload Document"
   - Select file (PDF, JPG, PNG, DOC, DOCX)
   - Choose appropriate category
   - Add title and description
   - Click upload

4. **Manage Documents**
   - View all documents in "My Documents"
   - Filter by category
   - Download or delete documents
   - View document details

5. **Share Documents**
   - Select document to share
   - Enter recipient's email
   - Set expiry time
   - Send shareable link via email

### For Developers

**Running Tests:**
```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

**Building for Production:**
```bash
# Frontend build
cd frontend
npm run build
# Output: dist/ folder

# Backend (no build needed)
cd backend
NODE_ENV=production npm start
```

## 🔒 Security Features

1. **Password Security**
   - Passwords hashed using bcryptjs with salt rounds
   - Never stored in plain text

2. **JWT Authentication**
   - Tokens expire after 30 days
   - Stored in localStorage (client-side)
   - Verified on every protected route

3. **OTP Verification**
   - Fixed OTP for testing: `123456`
   - In production: Random 6-digit OTP
   - Email-based verification

4. **Input Validation**
   - Server-side validation for all inputs
   - Email format validation
   - Aadhaar and phone number validation

5. **File Security**
   - Files stored as Base64 in MongoDB
   - Maximum file size: 50MB
   - Supported formats validated

6. **Document Sharing**
   - Time-limited share tokens
   - Unique tokens per share
   - Automatic expiry

## 🖼️ Screenshots

### Dashboard
*(Add screenshot of your dashboard here)*

### Document Upload
*(Add screenshot of upload page here)*

### Document List
*(Add screenshot of document list here)*

### Document Sharing
*(Add screenshot of share feature here)*

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

- Name: Akash Turkhade 
- GitHub: https://github.com/Akash79665/Secure-_-Share-Govt-Document.git
- Email: apturkhade@gmail.com

## 🙏 Acknowledgments

- MongoDB Documentation
- Express.js Documentation
- React Documentation
- Tailwind CSS
- Stack Overflow Community

## 📞 Support

For support, email apturkhade@gmail.com or create an issue in the repository.

---

**Made with ❤️ for secure document management**