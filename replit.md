# KeyPanel - Key Yönetim Sistemi

## Overview

KeyPanel is a modern key management system designed for social media services. It provides a secure platform for managing single-use keys through both admin and public user interfaces. The application features a dashboard for administrators to create and manage keys, services, and users, while providing a public interface for end users to validate keys and place orders.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with proper error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Session Storage**: PostgreSQL table for session persistence
- **Migration Strategy**: Drizzle Kit for schema migrations

## Key Components

### Database Schema
- **users**: Mandatory table for Replit Auth integration
- **sessions**: Required for session storage and authentication
- **keys**: Core table for managing API keys with usage tracking
- **services**: Configuration for available social media services
- **orders**: Transaction records linking keys to service requests
- **logs**: Activity tracking and audit trail

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Management**: Server-side sessions with PostgreSQL storage
- **Authorization**: Role-based access with admin/user distinction
- **Security**: HTTP-only cookies, secure session handling

### Admin Dashboard
- **Dashboard**: Overview statistics and key management
- **Key Management**: Create, view, and track key usage
- **Service Management**: Configure available social media services
- **User Management**: View and manage user accounts
- **Logging**: Activity tracking and audit trails
- **Settings**: System configuration options

### Public User Interface
- **Key Validation**: Verify key authenticity and availability
- **Service Selection**: Choose from available social media services
- **Order Placement**: Submit requests using validated keys
- **Responsive Design**: Mobile-friendly interface

## Data Flow

1. **Authentication Flow**:
   - User accesses admin routes → Redirected to Replit Auth
   - Successful authentication → Session created in PostgreSQL
   - Session validation on subsequent requests

2. **Key Management Flow**:
   - Admin creates keys → Stored in database with metadata
   - Keys distributed to users → Validation through public interface
   - Key usage → Marked as used, logged for audit

3. **Order Processing Flow**:
   - User validates key → System checks availability
   - Service selection → User chooses from active services
   - Order submission → Creates order record, marks key as used
   - External API integration → Processes service request

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation

### UI Dependencies
- **@radix-ui/***: Headless UI primitives
- **tailwindcss**: Utility-first CSS framework  
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Authentication Dependencies
- **openid-client**: OIDC authentication handling
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Server**: Express with Vite dev server middleware
- **Hot Reload**: Vite HMR for React components
- **Database**: Neon PostgreSQL with connection pooling
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPL_ID

### Production Build
- **Frontend**: Vite build output to dist/public
- **Backend**: ESBuild bundle to dist/index.js
- **Static Assets**: Served by Express in production
- **Database**: Production PostgreSQL with connection pooling

### Build Commands
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build (frontend + backend)
- `npm run start`: Production server
- `npm run db:push`: Push database schema changes

## Changelog

Changelog:
- June 28, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.