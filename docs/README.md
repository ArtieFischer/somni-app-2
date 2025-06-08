# Somni - AI-Powered Dream Analysis Platform

Welcome to the Somni project documentation. This directory contains comprehensive guides for developers working on the Somni platform.

## Documentation Structure

- **[Project Overview](./01-project-overview.md)** - Purpose, vision, and key features
- **[Getting Started](./02-getting-started.md)** - Setup and installation guide
- **[Monorepo Architecture](./03-monorepo-architecture.md)** - Project structure and workspace organization
- **[Development Guidelines](./04-development-guidelines.md)** - Code standards and best practices
- **[TypeScript Types & Interfaces](./05-types-interfaces.md)** - Complete type definitions reference
- **[API Reference](./06-api-reference.md)** - Supabase integration and API calls
- **[Testing Strategy](./07-testing-strategy.md)** - Testing frameworks and practices
- **[Deployment Guide](./08-deployment.md)** - Build and deployment processes
- **[Troubleshooting](./09-troubleshooting.md)** - Common issues and solutions
- **[Supabase Setup](./10-supabase-setup.md)** - Database setup with manual SQL execution

## Quick Links

- [Mobile App Development](./02-getting-started.md#mobile-development)
- [Web App Development](./02-getting-started.md#web-development)
- [Shared Package Usage](./03-monorepo-architecture.md#shared-packages)
- [Supabase Database Setup](./10-supabase-setup.md)
- [SQL Scripts for Manual Execution](../sql/README.md)
- [Database Migrations](../supabase/migrations/)

## Architecture Overview

The Somni project uses a monorepo structure with:

- **Two Applications**: Mobile (React Native + Expo) and Web (React + Vite)
- **Shared Packages**: Types and utilities shared between applications
- **Database**: Supabase with PostgreSQL and pgvector for semantic search
- **Version Control**: Git-based migrations and manual SQL scripts

## Database Schema

The project uses a modern database schema with:

- **User Profiles**: Extended user information beyond basic auth
- **Dreams**: Core dream entries with vector embeddings for semantic search
- **Analysis**: AI-generated dream interpretations
- **Symbols**: Extracted dream symbols and meanings
- **Vector Search**: Semantic similarity search using pgvector

## Key Features

- **Voice Recording**: Mobile-first dream recording with speech-to-text
- **AI Analysis**: Multiple interpretation frameworks (Freudian, Jungian, etc.)
- **Semantic Search**: Vector-based dream similarity search
- **Cross-Platform**: Separate optimized apps for mobile and web
- **Real-time Sync**: Live updates across devices
- **Privacy-First**: Row Level Security and user data protection

## Contributing

Please read through the relevant documentation sections before making changes to the codebase. All developers should follow the guidelines outlined in these documents to maintain consistency and quality across the project.

### Development Workflow

1. **Setup**: Follow [Getting Started](./02-getting-started.md) for initial setup
2. **Database**: Set up Supabase using [Supabase Setup](./10-supabase-setup.md)
3. **Development**: Follow [Development Guidelines](./04-development-guidelines.md)
4. **Testing**: Implement tests per [Testing Strategy](./07-testing-strategy.md)
5. **Deployment**: Use [Deployment Guide](./08-deployment.md) for releases

### Architecture Decisions

- **Separate Apps vs react-native-web**: We use separate optimized applications for better performance and platform-specific features
- **Supabase**: Chosen for its PostgreSQL foundation, real-time capabilities, and vector search support
- **TypeScript**: Strict typing across the entire codebase for better developer experience
- **Monorepo**: Shared code and consistent tooling while maintaining application independence

For detailed architectural decisions, see [Architecture Decision](./architecture-decision.md).