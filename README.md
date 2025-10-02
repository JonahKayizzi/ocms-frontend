# OCMS Frontend - Online Courses & Assessments Management System

A React TypeScript frontend application for managing online courses, assessments, modules, lessons, and materials.

## Features

- **Course Management**: Create, edit, publish, and manage courses with start/end dates
- **Module Organization**: Organize course content into modules
- **Rich Text Lessons**: Create lessons with rich text content and video support
- **Assessment System**: Build course-based and standalone assessments with questions
- **Material Management**: Upload and manage course materials
- **Status Tracking**: Track course status (Draft, Published, Completed, Deactivated)
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **React 19** with TypeScript
- **Redux Toolkit Query** for API state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Quill** for rich text editing

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- OCMS Backend running on port 8091

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CourseCard.tsx
│   └── CourseForm.tsx
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── CourseManagementPage.tsx
│   └── CourseDetailPage.tsx
├── redux/              # Redux store and API slice
│   ├── store.ts
│   └── apiSlice.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

## API Integration

The frontend communicates with the OCMS Backend API running on `http://localhost:8091`. All API calls are managed through Redux Toolkit Query for efficient caching and state management.

### Key Endpoints

- **Courses**: `/courses`, `/courses/published`, `/courses/completed`
- **Modules**: `/modules/course/{courseId}`
- **Lessons**: `/course-lessons/course/{courseId}`
- **Assessments**: `/assessments/course/{courseId}`, `/assessments/standalone`
- **Questions**: `/assessment-questions/assessment/{assessmentId}`
- **Materials**: `/course-materials/course/{courseId}`

## Authentication

Currently, the app uses JWT tokens stored in localStorage. The token is automatically attached to API requests through the base query configuration.

## Features Overview

### Home Page
- Displays published and completed courses
- Course cards with status badges
- Navigation to admin panel

### Course Management
- List all courses with status indicators
- Create new courses with rich form
- Edit existing courses
- Course statistics dashboard

### Course Details
- View course information and timeline
- Browse modules and lessons
- Course content organization

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Code Style

The project uses ESLint for code quality and Prettier for formatting. TypeScript provides type safety throughout the application.

## Deployment

The built application can be deployed to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Connect to Git repository
- **AWS S3**: Upload build folder
- **GitHub Pages**: Use `gh-pages` package

## Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8091
REACT_APP_ENVIRONMENT=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the SMS Migration system.