# LibraryFlow - Library Management System

## Overview

LibraryFlow is a modern full-stack library management system built with a React frontend and Express.js backend. The application provides comprehensive library operations including book management, user reservations, payment processing, and administrative functions.

## System Architecture

The application follows a monorepo structure with clear separation between frontend and backend components:

- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OIDC integration
- **Payment Processing**: Stripe integration
- **UI Framework**: Tailwind CSS with shadcn/ui components

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with development server and production builds
- **Styling**: Tailwind CSS with custom library theme variables
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with OpenID Connect (Replit Auth)
- **Session Management**: Express sessions with PostgreSQL store
- **Payment Processing**: Stripe API integration
- **API Design**: RESTful endpoints with proper error handling

### Database Schema
The database includes the following main entities:
- **Users**: Authentication and profile information with role-based access
- **Books**: Catalog management with availability tracking
- **Reservations**: Book lending system with due dates
- **Fines**: Payment tracking for overdue books
- **Sessions**: Required for Replit Auth session management

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit OIDC, sessions stored in PostgreSQL
2. **Book Management**: CRUD operations for books with real-time availability updates
3. **Reservation System**: Users can reserve books, track due dates, and return books
4. **Payment Processing**: Stripe integration for fine payments with webhook handling
5. **Admin Functions**: Role-based access for user management and inventory control

## External Dependencies

### Authentication
- **Replit Auth**: OIDC-based authentication system
- **Session Storage**: PostgreSQL-backed session management

### Payment Processing
- **Stripe**: Credit card processing for fine payments
- **Webhook Integration**: Real-time payment status updates

### Database
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Drizzle ORM**: Type-safe database operations with automatic migrations

## Deployment Strategy

The application supports multiple deployment platforms:

### Replit Deployment
- **Development**: `npm run dev` - Concurrent frontend and backend development
- **Production Build**: `npm run build` - Vite frontend build + esbuild backend bundle
- **Production Runtime**: `npm run start` - Serves built application
- **Database Migrations**: `npm run db:push` - Applies schema changes

### Docker Deployment (Render, Railway, etc.)
- **Dockerfile**: Production-ready multi-stage Docker build
- **render.yaml**: Automated deployment configuration for Render
- **Environment Detection**: Automatically uses appropriate authentication system
- **Database Setup**: Automatic schema creation on first deployment
- **Health Checks**: Built-in health monitoring for cloud platforms

### Environment Configuration

#### Core Variables
- **NODE_ENV**: Environment detection for development/production features
- **PORT**: Server port (auto-set by cloud platforms)
- **DATABASE_URL**: PostgreSQL connection string

#### Payment Processing
- **STRIPE_SECRET_KEY**: Server-side Stripe API key
- **VITE_STRIPE_PUBLIC_KEY**: Client-side Stripe publishable key

#### Authentication
- **SESSION_SECRET**: Session encryption key
- **REPLIT_DOMAINS**: Domain for Replit Auth (optional for cloud deployment)
- **REPL_ID**: Application ID for Replit Auth (optional for cloud deployment)
- **ISSUER_URL**: OIDC issuer URL (defaults to Replit OIDC)

### Replit-Specific Features
- **Cartographer Integration**: Development-only code mapping
- **Runtime Error Overlay**: Enhanced error reporting in development
- **Auto-scaling Deployment**: Configured for Replit's autoscale platform

## Changelog

```
Changelog:
- January 6, 2025. Added mock data support for cloud deployment
  * Application now works without requiring database connection
  * Uses sample library data when DATABASE_URL is not available
  * Perfect for testing deployments on Render, Railway, etc.
  * Previous database functionality remains when DATABASE_URL is provided
- January 6, 2025. Added Docker deployment support
  * Created Dockerfile and .dockerignore for containerized deployment
  * Added render.yaml for automated Render deployment
  * Implemented fallback authentication system for non-Replit deployments
  * Updated server configuration for cloud platform compatibility
  * Created comprehensive deployment documentation
- June 15, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```