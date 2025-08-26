# Invoice Pro - Invoice Management System

## Overview

Invoice Pro is a full-stack invoice management application built with React, Express, and PostgreSQL. The system allows users to create, manage, and track invoices with clients, featuring a modern UI with PDF generation capabilities. The application follows a monorepo structure with shared types and schemas between frontend and backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support

The frontend is structured as a single-page application with:
- Dashboard for analytics and overview
- Invoice management with CRUD operations
- Client management capabilities
- PDF generation for invoices using jsPDF and html2canvas

### Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Schema Validation**: Zod schemas shared between frontend and backend for consistent data validation
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful endpoints for clients, invoices, and line items

The backend implements a service layer pattern with:
- Route handlers in `server/routes.ts`
- Storage abstraction interface in `server/storage.ts` 
- Shared schemas in `shared/schema.ts` for type consistency

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database queries and migrations
- **Schema Management**: Database schema defined with Drizzle's PostgreSQL schema builder
- **Data Models**: Three main entities - clients, invoices, and line items with proper foreign key relationships

Database schema includes:
- Clients table with contact information
- Invoices table with comprehensive billing details and status tracking
- Line items table for invoice item details with quantity and pricing

### Authentication and Authorization
The application currently uses a memory-based storage implementation as indicated by the `MemStorage` class, suggesting it's prepared for authentication but not yet fully implemented. Session management is configured with `connect-pg-simple` for PostgreSQL session storage.

### External Dependencies
- **UI Framework**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Database**: Neon PostgreSQL serverless database
- **PDF Generation**: jsPDF and html2canvas for client-side PDF creation
- **Build Tools**: Vite for frontend bundling and esbuild for backend compilation
- **Development**: TypeScript for type safety across the entire stack
- **Validation**: Zod for runtime type checking and form validation
- **Date Handling**: date-fns for date formatting and manipulation

The system is designed for deployment on Replit with specific configurations for the platform including development banner integration and error overlay functionality.