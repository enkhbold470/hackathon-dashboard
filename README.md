# Hackathon Dashboard

A streamlined application for managing hackathon applications and participants.

## Features

- User authentication with Clerk
- Application submission and management
- Dynamic form configuration
- Real-time auto-saving of form fields
- Application status tracking

## Project Structure

```
├── app/                  # Next.js application routes
│   ├── api/              # API routes (consolidated)
│   │   └── db/           # Database-related API endpoints
├── components/           # React components
│   ├── ui/               # UI components (using shadcn/ui)
│   └── application*.tsx  # Application-specific components  
├── lib/                  # Shared libraries and utilities
│   ├── applicationData.ts # Form field configuration
│   ├── prisma.ts         # Prisma client configuration
├── prisma/               # Database schema
├── public/               # Static assets
```

## API Structure

The API has been consolidated into a single route file with action-based routing:

- GET `/api/db?action=get-application&userId=123` - Retrieves an application
- GET `/api/db?action=test-connection` - Tests database connectivity
- POST `/api/db` with body `{ action: 'save-application', userId: '123', ...formData }` - Saves application data
- POST `/api/db` with body `{ action: 'submit-application', userId: '123' }` - Submits an application

## Form Structure

The application form has been optimized for:

1. Better performance
2. Simplified maintenance
3. Easier field editing
4. Real-time saving with visual feedback

The form is dynamically generated from the configuration in `lib/applicationData.ts`, making it easy to:

- Add/remove form fields
- Change validation rules
- Reorganize form sections
- Modify field labels and descriptions

## Development

```bash
# Install dependencies
pnpm install

# Setup database
pnpm prisma:generate
pnpm prisma:push

# Start development server
pnpm dev
```

## Optimizations

The following optimizations have been implemented:

1. **Consolidated API Routes**: Simplified API structure with action-based routing
2. **Dynamic Form Rendering**: Generated from configuration for easier maintenance
3. **Real-time Field Saving**: Immediate feedback with visual indicators
4. **Reduced Initial Load Time**: Streamlined code and optimized form rendering
5. **Improved Type Safety**: Better TypeScript typing throughout the application  