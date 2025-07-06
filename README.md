# LibraryFlow - Library Management System

A comprehensive library management system built with React, Express.js, and PostgreSQL. Features user authentication, book catalog management, reservations, and payment processing.

## Features

- **User Authentication**: Secure login via Replit OIDC
- **Book Catalog**: Browse, search, and filter books with advanced search capabilities
- **Reservations**: Reserve books with due date tracking and return management
- **Payment Processing**: Secure fine payments via Stripe integration
- **Admin Panel**: User management and inventory control for administrators
- **Responsive Design**: Modern UI with Tailwind CSS and shadcn/ui components

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and build
- Tailwind CSS with shadcn/ui components
- TanStack Query for server state management
- Wouter for client-side routing
- React Hook Form with Zod validation
- Stripe React components for payments

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL with Drizzle ORM
- Passport.js with OpenID Connect (Replit Auth)
- Stripe API for payment processing
- Express sessions with PostgreSQL store

### Database
- PostgreSQL with connection pooling
- Drizzle ORM for type-safe database operations
- Automated schema migrations

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Stripe account for payment processing
- Replit account for authentication

### Environment Variables
Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL=your_postgresql_connection_string

# Stripe
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Session (automatically provided by Replit)
SESSION_SECRET=your_session_secret
REPLIT_DOMAINS=your_replit_domain
REPL_ID=your_repl_id
```

### Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd libraryflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── pages/          # Page components
│   │   └── index.css       # Global styles and CSS variables
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection and configuration
│   ├── index.ts           # Express server setup
│   ├── replitAuth.ts      # Authentication middleware
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations and business logic
│   └── vite.ts            # Vite integration for development
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle database schema and types
└── package.json           # Project dependencies and scripts
```

## Key Features

### Authentication
- Secure authentication via Replit OIDC
- Role-based access control (user/admin)
- Session management with PostgreSQL store

### Book Management
- Complete CRUD operations for books
- Advanced search with filters (genre, author, availability, publication year)
- Availability tracking with copy management
- Book cover images and detailed descriptions

### Reservation System
- Book reservation with 2-week loan periods
- Due date tracking with overdue notifications
- Return processing with availability updates
- Reservation history tracking

### Payment Processing
- Secure payment processing via Stripe
- Fine calculation and tracking
- Payment history and confirmations
- Real-time payment status updates

### Admin Features
- User management with role assignments
- Book inventory management
- Reservation monitoring
- Payment and fine tracking

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login
- `GET /api/logout` - Logout user

### Books
- `GET /api/books` - Get all books with search/filter
- `GET /api/books/:id` - Get specific book
- `POST /api/books` - Create book (admin only)
- `PUT /api/books/:id` - Update book (admin only)
- `DELETE /api/books/:id` - Delete book (admin only)

### Reservations
- `GET /api/reservations` - Get user reservations
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/:id` - Update reservation

### Payments
- `POST /api/create-payment-intent` - Create Stripe payment intent
- `POST /api/payment/confirm` - Confirm payment

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/reservations` - Get all reservations (admin only)

## Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - User accounts and profiles
- `books` - Book catalog with availability tracking
- `reservations` - Book reservations and loans
- `fines` - Fine tracking and payment status
- `payments` - Payment records and transaction history
- `sessions` - User session management (required for Replit Auth)

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

## Deployment

The application is configured for deployment on Replit with:
- Automatic builds with Vite
- PostgreSQL database integration
- Environment variable management
- Session persistence across deployments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the documentation in this README
- Review the code comments for implementation details
- Contact the development team for technical assistance