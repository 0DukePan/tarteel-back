# Tarteel Quran School Backend API

## Project Overview

Welcome to the backend API for the Tarteel Quran School platform. This application serves as the core infrastructure for a comprehensive Quranic education system, facilitating student learning, teacher management, classroom organizations, and administrative operations. It is built to be robust, scalable, and secure, supporting a modern web interface for students, parents, teachers, and administrators.

The system integrates advanced features such as AI-powered Tajweed analysis (via Tarteel.ai), real-time virtual classrooms, gamified learning with spaced repetition for Hifz (memorization), and complex scheduling systems.

## Technology Stack

This project is built using a modern, type-safe stack:

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (hosted on Neon)
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens) and Google OAuth 2.0
- **Payments**: Stripe API
- **Real-time Communication**: Socket.IO
- **AI Integration**: Tarteel.ai API
- **Testing**: Jest

## Key Features

### Authentication & Authorization
- Secure role-based authentication (Admin, Teacher, Parent, Student)
- Google OAuth integration for simplified admin access
- JWT-based session management with secure cookie handling

### Academic Management
- **Classes**: flexible class structures with capacity management
- **Curriculum**: structured lesson planning and resource organization
- **Assignments & Submissions**: full homework lifecycle with grading
- **Attendance**: tracking and reporting for student participation
- **Grading**: comprehensive gradebook functionality

### Quranic Education
- **Quran API**: integration with Quran.com for verse data
- **AI Tajweed**: automated recitation analysis and correction
- **Hifz System**: spaced repetition algorithms for memorization review
- **Video Lessons**: library of educational content with progress tracking

### Gamification & Engagement
- **XP & Levels**: experience points system to reward consistency
- **Badges**: achievement system for milestones (e.g., "First Juz Completed")
- **Leaderboards**: competitive rankings to motivate students
- **Competitions**: organized Quran competitions with prize management
- **Ramadan Challenge**: special seasonal tracking for daily Quran reading

### Scheduling & Virtual Classrooms
- **Teacher Availability**: flexible slot management
- **Booking System**: easy session booking for students
- **Virtual Classrooms**: real-time video/audio integration pointers

### Financial & Administrative
- **Stripe Integration**: subscriptions, one-time payments, and invoices
- **Family Plans**: tiered pricing for families and scholarships
- **School Licensing**: B2B features for institutional licensing

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- PostgreSQL database (or a Neon connection string)

### Steps

1.  **Clone the Repository**
    Navigate to the backend directory.

2.  **Install Dependencies**
    Run the following command to install all required packages:
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory. You will need to configure the following variables:
    - `PORT`: Server port (default: 5000)
    - `DATABASE_URL`: Your PostgreSQL connection string
    - `JWT_SECRET`: Secret key for token signing
    - `STRIPE_SECRET_KEY`: Your Stripe secret key
    - `TARTEEL_API_KEY`: API key for Tarteel.ai services
    - `GOOGLE_CLIENT_ID`: OAuth client ID
    - `GOOGLE_CLIENT_SECRET`: OAuth client secret
    - `FRONTEND_URL`: URL of the frontend application

4.  **Database Migration**
    Apply the database schema using Drizzle Kit:
    ```bash
    npm run db:push
    ```

5.  **Start the Server**
    For development (with hot reload):
    ```bash
    npm run dev
    ```
    For production:
    ```bash
    npm run build
    npm start
    ```

## Database Management

We use Drizzle ORM for database interactions. Key commands include:

- `npm run db:generate`: Generate migration files from schema changes
- `npm run db:migrate`: Apply migrations to the database
- `npm run db:push`: Push schema changes directly to the database (useful for prototyping)
- `npm run db:studio`: Open Drizzle Studio to view and edit data visually

## API Architecture

The API, generally mounted at `/api`, is organized into modular routes:

- **Auth**: `/api/auth`, `/api/oauth` (Google)
- **Academic**: `/api/classes`, `/api/assignments`, `/api/grades`, `/api/attendance`
- **Users**: `/api/students`, `/api/teachers`, `/api/parents`
- **Quran & Hifz**: `/api/quran`, `/api/hifz`, `/api/tajweed`, `/api/recitations`
- **Gamification**: `/api/gamification`, `/api/badges`, `/api/leaderboard`, `/api/competitions`
- **Finance**: `/api/payments`, `/api/invoices`, `/api/stripe`, `/api/family`
- **Communication**: `/api/messages`, `/api/notifications`, `/api/forums`
- **Scheduling**: `/api/scheduling`, `/api/virtual-classrooms`

## Testing

The project includes a test suite using Jest.
Run tests with:
```bash
npm test
```

## Contributing

Please ensure you follow the established code style and TypeScript configurations. All new features should include appropriate type definitions and error handling.
