# 🧩 SaaS Dashboard - Frontend

This is the **frontend** of a SaaS-ready CMS Dashboard built using **Next.js**. It enables admins and content creators to manage blog content, categories, SEO metadata, and more through a clean and responsive interface.

## 🚀 Features

- ✅ Responsive dashboard UI with dynamic routing
- ✅ Admin layout with sidebar navigation and top header
- ✅ JWT-based authentication flow
- ✅ Integrated WYSIWYG editor for blog post creation
- ✅ SEO-friendly meta tag management
- ✅ Role-based access control (Admin, Editor, etc.)
- ✅ Optimized performance with API response compression
- ✅ Modular component structure for easy scaling

## 🔗 Related Repositories

- **🔧 Backend API** (Node.js + Sequelize + Slim-style structure):  
  👉 [https://github.com/Satwik0924/cms-api](https://github.com/Satwik0924/cms-api)

## 📦 Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **State Management**: React Context API or Redux (if applicable)
- **API Integration**: Axios/Fetch with async/await
- **Editor**: Any modern WYSIWYG editor (e.g., TipTap, Quill.js)
- **Auth**: JWT token-based authentication
- **Form Validation**: Yup + React Hook Form

## 📁 Folder Structure

```bash
.
├── components/       # Reusable UI components
├── pages/            # Next.js pages
├── services/         # API calls
├── utils/            # Helper functions
├── public/           # Static assets
├── styles/           # Global styles
├── .env.local        # Environment variables
└── README.md
