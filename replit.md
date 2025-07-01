# Business Development Idea Agent

## Overview

The Business Development Idea Agent is a comprehensive web application that leverages AI to help entrepreneurs refine their business ideas using industry insights, market data, and expert interviews. The system integrates Google's Gemini AI to provide intelligent business advice based on real-world data sources including SSDC (Singapore SkillsFuture Development Centre) interview transcripts and market survey data.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend, backend, and data layers:

- **Frontend**: React-based SPA using Vite for development and build tooling
- **Backend**: Express.js server with TypeScript 
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OAuth integration with session management
- **AI Integration**: Google Gemini AI for business analysis and recommendations
- **UI Framework**: Shadcn/ui components with Tailwind CSS styling

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite build system
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with Shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Server**: Express.js with TypeScript for type safety
- **Database Layer**: Drizzle ORM with PostgreSQL adapter (Neon serverless)
- **Authentication**: OpenID Connect with Replit OAuth provider
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **AI Service**: Google Gemini integration for business analysis

### Database Schema
The database includes the following main entities:
- **Users**: User profiles and authentication data
- **SSDC Transcripts**: Interview transcripts from industry experts
- **Market Survey Data**: Market research and industry insights
- **Business Forms**: User-created business idea submissions
- **AI Chat Sessions**: Conversation history with AI assistant
- **Sessions**: Authentication session storage

### Core Features
1. **SSDC Transcript Management**: Browse and search industry expert interviews
2. **Market Survey Data**: Access and analyze market research data
3. **Business Form Builder**: Create and refine business concepts
4. **AI Chat Assistant**: Interactive business advice powered by Gemini AI
5. **Admin Panel**: Content management for transcripts and market data

## Data Flow

1. **User Authentication**: OAuth flow via Replit for secure user sessions
2. **Content Discovery**: Users browse SSDC transcripts and market data
3. **Business Form Creation**: Users input business ideas through structured forms
4. **AI Analysis**: Gemini AI analyzes business concepts against available data
5. **Interactive Refinement**: Chat-based interface for iterative improvement
6. **Data Persistence**: All user data and AI interactions stored in PostgreSQL

## External Dependencies

### Core Dependencies
- **@google/genai**: Google Gemini AI integration
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **express**: Web server framework
- **react**: Frontend UI library
- **@tanstack/react-query**: Server state management

### Authentication & Session
- **openid-client**: OAuth authentication
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### UI & Styling
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form handling
- **@hookform/resolvers**: Form validation
- **zod**: Schema validation

## Deployment Strategy

The application is designed for Replit deployment with the following considerations:

1. **Environment Variables**: 
   - `DATABASE_URL`: PostgreSQL connection string
   - `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY`: AI service authentication
   - `SESSION_SECRET`: Session encryption key
   - `REPLIT_DOMAINS`: OAuth configuration

2. **Build Process**:
   - Vite builds the frontend to `dist/public`
   - ESBuild bundles the server to `dist/index.js`
   - Database migrations handled via Drizzle Kit

3. **Production Considerations**:
   - Static assets served from Express in production
   - Database connection pooling via Neon serverless
   - Session persistence in PostgreSQL

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```