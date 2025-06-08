# Somni - AI-Powered Dream Analysis Platform

<!-- Testing GitHub connection - this is a minor change -->

A comprehensive dream tracking and analysis application built with React Native (Expo) and React (Vite) in a monorepo structure.

## Features

- **Voice-First Dream Recording**: Record dreams with speech-to-text
- **AI Dream Analysis**: Multiple interpretation frameworks
- **Cross-Platform**: Mobile and web applications
- **Real-time Sync**: Supabase backend with real-time updates
- **Vector Search**: Semantic dream similarity search

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase (see docs/10-supabase-setup.md)
4. Start development:
   - Mobile: `npm run dev:mobile`
   - Web: `npm run dev:web`

## Documentation

See the `docs/` directory for comprehensive guides:
- [Getting Started](./docs/02-getting-started.md)
- [Supabase Setup](./docs/10-supabase-setup.md)
- [API Reference](./docs/06-api-reference.md)

## Architecture

This project uses a monorepo structure with:
- Mobile app (React Native + Expo)
- Web app (React + Vite)
- Shared packages (types, utils)
- Supabase backend

## License

MIT