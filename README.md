# 🚀 AI Career Copilot

> Your AI-powered assistant for creating perfect job applications

Transform your job search with AI-generated, tailored application materials that help you stand out from the crowd.

---

## 🎯 What Does It Do?

AI Career Copilot helps you create **custom job application materials** in minutes. Simply upload your resume and paste a job description, and our AI will generate:

- ✨ **Tailored Resume** - Your CV rewritten to match the job perfectly
- 📝 **Professional Cover Letter** - Personalized for the company and role
- 🎯 **Skills Analysis** - Shows which of your skills match the job
- 📊 **Skills Gap Report** - Identifies areas to highlight or learn
- 💼 **Interview Questions** - Practice questions based on the role
- 📄 **PDF Export** - Download everything as professional PDFs

---

## ✨ Key Features

### 🔐 Secure Account System
- Create your personal account
- All your applications saved securely
- Access from anywhere, anytime

### 📁 Resume Library
- Upload and store multiple resumes
- Reuse for different applications
- Organized in one place

### 🤖 AI-Powered Generation
- Uses Google's latest Gemini AI
- Analyzes both your CV and job requirements
- Creates professional, tailored content in seconds

### 📥 Multiple Export Options
- **Export CV Only** - Just your tailored resume
- **Export Cover Letter** - Professional cover letter
- **Complete Package** - Everything in one PDF (CV, cover letter, analysis, interview prep)

### 💫 Beautiful Interface
- Clean, modern design
- Easy to navigate
- Works on desktop, tablet, and mobile

---

## 🏃 Quick Start Guide

### For Users (Non-Technical)

1. **Sign Up**
   - Visit the website
   - Click "Sign Up"
   - Create your account with email and password

2. **Upload Your Resume**
   - Go to "New Application"
   - Upload your resume PDF (optional - for safekeeping)
   - Paste your resume text

3. **Add Job Description**
   - Copy the job posting from the company's website
   - Paste it into the job description box

4. **Generate!**
   - Click "Generate"
   - Wait 10-20 seconds
   - View your customized materials

5. **Download as PDF**
   - Click "Export PDF"
   - Choose what to download:
     - Just the CV
     - Just the cover letter
     - Everything together

---

## 🛠️ For Developers - Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB account (free tier works)
- Google AI Studio API key (free tier available)
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-career-copilot.git
   cd ai-career-copilot/AICareerCopilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # Authentication
   AUTH_SECRET=your_random_secret_key_32_characters

   # Google Gemini AI
   GOOGLE_API_KEY=your_google_ai_api_key

   # Supabase Storage
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   SUPABASE_BUCKET=resumes
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to [http://localhost:5000](http://localhost:5000)

---

## 🔧 Technology Stack

### Frontend
- **Next.js 16** - Modern React framework
- **TypeScript** - Type-safe code
- **TailwindCSS** - Beautiful styling
- **Shadcn/ui** - Premium UI components

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB** - Database for users and applications
- **Mongoose** - Database modeling

### AI & Services
- **Google Gemini 2.0** - AI content generation
- **Supabase** - File storage for resumes
- **NextAuth.js** - Secure authentication

### Additional Libraries
- **jsPDF** - PDF generation
- **React Hot Toast** - Notifications
- **Zod** - Input validation
- **date-fns** - Date formatting

---

## 📁 Project Structure

```
AICareerCopilot/
├── app/
│   ├── (auth)/              # Login & signup pages
│   ├── (dashboard)/         # Protected pages
│   │   ├── dashboard/       # Application list
│   │   ├── applications/    # Application pages
│   │   └── resumes/         # Resume library
│   ├── api/                 # Backend API routes
│   │   ├── auth/           # Authentication
│   │   ├── applications/   # CRUD operations
│   │   ├── generate/       # AI generation
│   │   └── upload/         # File uploads
│   └── page.tsx            # Landing page
├── components/              # Reusable UI components
├── lib/                    # Utility functions
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # MongoDB connection
│   ├── gemini.ts          # AI configuration
│   ├── storage.ts         # Supabase utilities
│   └── pdfExport.ts       # PDF generation
├── models/                 # Database schemas
│   ├── User.ts
│   ├── Application.ts
│   └── Resume.ts
└── .env.local             # Environment variables
```

---

## 🎨 How It Works

### Step-by-Step Flow

1. **User Authentication**
   - User creates an account or logs in
   - Session secured with JWT tokens

2. **Resume Upload (Optional)**
   - User uploads resume PDF to Supabase
   - Metadata saved to MongoDB
   - Resume stored in library for future use

3. **Application Creation**
   - User pastes CV text and job description
   - Data validated (CV ≥ 100 chars, job description ≥ 50 chars)
   - Draft application created in MongoDB

4. **AI Generation**
   - Gemini AI analyzes CV and job description
   - Generates tailored content:
     - Rewritten CV optimized for keywords
     - Professional cover letter
     - Skills analysis
     - Interview questions
   - Content saved to database

5. **Results Display**
   - Beautiful tabbed interface shows all content
   - Copy to clipboard functionality
   - PDF export options

6. **PDF Export**
   - jsPDF generates formatted PDFs
   - Three export options available
   - Downloads automatically with job name in filename

---

## 🔒 Security & Privacy

- ✅ **Secure Authentication** - Passwords hashed with bcrypt
- ✅ **Protected Routes** - Middleware ensures only logged-in users access apps
- ✅ **Data Isolation** - Users only see their own data
- ✅ **Secure Storage** - Supabase with Row Level Security
- ✅ **Environment Variables** - Sensitive keys never in code

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### MongoDB Setup
- Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get connection string
- Add to `MONGODB_URI`

### Supabase Setup
- Create project at [Supabase](https://supabase.com)
- Create `resumes` storage bucket
- Enable Row Level Security
- Add keys to environment variables

### Google AI Setup
- Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Add to `GOOGLE_API_KEY`

---

## 📖 Usage Examples

### Example 1: Software Engineer Application
```
Input CV: 5 years experience in React, Node.js...
Job: Senior Full-Stack Developer at TechCorp

Output: 
- CV highlighting React & Node.js experience
- Cover letter mentioning TechCorp's mission
- Skills match: React, Node.js, TypeScript
- Interview questions about system design
```

### Example 2: Marketing Manager
```
Input CV: Marketing professional with campaign experience...
Job: Digital Marketing Manager at StartupXYZ

Output:
- CV showcasing campaign results & metrics
- Cover letter addressing StartupXYZ's growth stage
- Skills match: SEO, Analytics, Campaign Management
- Interview questions about growth strategies
```

---

## 🤝 Contributing

We welcome contributions! To maintain code quality:

1. **Create a branch** for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, commented code
   - Follow existing patterns

3. **Test thoroughly**
   - Test all affected features
   - Ensure no breaking changes

4. **Submit a pull request**
   - Describe what you changed and why
   - Reference any related issues

---

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙋 Support & Questions

**For Users:**
- Check the in-app help sections
- Review this README

**For Developers:**
- Open an issue on GitHub
- Check existing documentation
- Review the codebase structure above

---

## 🎉 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI model
- [Supabase](https://supabase.com/) - Backend services
- [MongoDB](https://www.mongodb.com/) - Database
- [Shadcn/ui](https://ui.shadcn.com/) - UI components

---

**Made with ❤️ to help job seekers land their dream roles**
