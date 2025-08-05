# Horizon Insurance Portal Template

This repository provides a scaffold for building a vehicle insurance management system with role-based access (Admin, Sub Admin, Customer).

## Structure
- **src/** – React front-end powered by Vite and Tailwind CSS.
- **backend/** – Express server skeleton with configuration placeholders.
- **public/** – Static assets.

## Getting Started
### Front-end
```bash
npm install
npm run dev
```
### Back-end
```bash
cd backend
npm install
npm run dev
```

Create a `.env` file in the `backend` directory based on `.env.example` before running the server.

## Features to Implement
- Authentication (email, Google, Apple)
- Role-based dashboards for Admin, Sub Admin, Customer
- Policy creation, assignment and viewing
- Invoice generation and document download
- Responsive UI matching provided designs

Use this template as a starting point and extend it to meet full project requirements.
