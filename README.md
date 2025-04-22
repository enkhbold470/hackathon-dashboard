# Hackathon Application Dashboard

A modern, feature-rich application management system for hackathon organizers and participants. This system handles the entire application lifecycle from initial draft to final acceptance and confirmation.

## Features

- **Real-time Form Saving**: Applications are automatically saved as users type
- **Status Tracking**: View application status (not started, in progress, submitted, accepted, rejected, confirmed)
- **Detailed Logging**: Comprehensive debug logs for easy troubleshooting
- **User Authentication**: Secure user authentication via Clerk
- **Responsive Design**: Works on all device sizes and types

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- PostgreSQL database
- Clerk.dev account for authentication

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hackathon-dashboard.git
   cd hackathon-dashboard
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables in `.env.local`:
   ```
   # Database connection
   DATABASE_URL=postgres://username:password@localhost:5432/hackathon_db
   
   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. Run database migrations:
   ```bash
   pnpm db:migrate
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

## Debugging

This application has built-in comprehensive debug logging to help troubleshoot issues:

### Log Format

All logs follow a consistent format with context prefixes:
- `[Middleware]` - Request tracking and auth checks
- `[API GET/POST]` - API endpoint operations
- `[ApplicationDashboard]` - Main dashboard component
- `[ApplicationForm]` - Form component operations

### Common Debug Scenarios

#### Authentication Issues

Authentication-related logs:
```
[Middleware] Request: GET /api/db/get-application
[Middleware] Authenticated user: user_2x...
[API GET] Authorized user: user_2x...
```

#### Application Creation/Saving

Look for these logs when troubleshooting application saving:
```
[ApplicationDashboard] Form data changed: {"legalName":"John Doe"}
[ApplicationDashboard] Saving application draft to database
[API POST] Saving application for user user_2x...
[API POST] Application saved successfully for user user_2x, id: 123
```

#### Submission Issues

When applications aren't submitting properly:
```
[ApplicationDashboard] Starting application submission process
[API POST] Submitting application for user user_2x...
[API POST] Application submitted successfully for user user_2x, id: 123
```

## Development Information

### Key Components

- `application-dashboard.tsx`: Main dashboard with tabs for application and status
- `application-form.tsx`: Form handling with validation and autosave
- `application-status.tsx`: Status display with animations and progress tracking
- `app/db/[action]/route.ts`: API routes for database operations
- `middleware.ts`: Authentication and request logging

### Database Schema

The application uses a PostgreSQL database with a primary `applications` table:

| Column                | Type           | Description                      |
|-----------------------|----------------|----------------------------------|
| id                    | SERIAL         | Primary key                      |
| user_id               | TEXT           | Clerk Auth user ID (unique)      |
| legal_name            | VARCHAR(255)   | Applicant's name                 |
| email                 | VARCHAR(255)   | Email address                    |
| university            | VARCHAR(255)   | University/school                |
| ... other fields ...  |                |                                  |
| status                | VARCHAR(50)    | Application status               |
| created_at            | TIMESTAMPTZ    | Creation timestamp               |
| updated_at            | TIMESTAMPTZ    | Last update timestamp            |

## License

MIT 