# HireSense AI

HireSense is an AI-powered recruitment and career intelligence platform designed to connect talent with opportunities through semantic job matching, automated resume parsing, and role fit analysis.

---

## Features

- **AI Resume Analyzer:** Upload text-based PDF resumes for automated skill extraction, strengths, and gap analysis powered by Google Gemini.
- **Semantic Job Matching:** Profile & job embeddings with cosine similarity scoring, providing match snapshots and evidence-based fit explanations.
- **Candidate Workspace:** Discover matched roles, track submitted applications, and view real-time status updates.
- **Recruiter Pipeline:** Manage job postings, review applicants, and analyze candidate alignment.
- **Authentication:** Secure JWT authentication with support for Google OAuth sign-in.

---

## Tech Stack

- **Frontend:** React, Vite, React Router, Lucide Icons, Plain CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Google Auth Library, Gemini API (@google/genai / REST)

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally or MongoDB Atlas connection string

### 2. Backend Setup
```sh
cd backend
npm install
cp .env.example .env
```
Configure your `backend/.env` with:
- `MONGODB_URI`: Your MongoDB connection URL
- `JWT_SECRET`: A secure random secret key
- `GEMINI_API_KEY`: Google Gemini API key for resume analysis & embeddings
- `GOOGLE_CLIENT_ID`: (Optional) OAuth Client ID for Google login

Run the backend development server:
```sh
npm run dev
```
API runs on `http://localhost:5000` by default.

### 3. Frontend Setup
```sh
cd frontend
npm install
cp .env.example .env
```
Configure `frontend/.env`:
- `VITE_API_URL=http://localhost:5000/api`
- `VITE_GOOGLE_CLIENT_ID`: (Optional) Same Google Client ID for frontend button

Run the frontend development server:
```sh
npm run dev
```
Frontend runs on `http://localhost:5173`.
