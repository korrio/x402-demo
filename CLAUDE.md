# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

x402 protocol demo application - a payment layer for the web that enables native payments across chains and tokens.

## Architecture

Monorepo structure with separate backend and frontend:
- `/backend` - ElysiaJS API server running on Bun
- `/frontend` - React application with Vite

## Development Commands

### Backend
```bash
cd backend
bun install          # Install dependencies
bun run dev          # Run with hot reload (port 3000)
bun run start        # Run production build
bun test             # Run all tests
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Run Vite dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

## API Endpoints

### Free Endpoints
- `GET /` - API information
- `GET /health` - Health check
- `GET /api/data` - Free sample data

### Protected Endpoints
- `GET /free` - Simple 402 response (without x402 protocol)
- `GET /protected` - x402-protected endpoint (returns 402 with x402 header)
- `GET /api/premium` - Premium API data (x402 protected)
- `GET /api/verify-payment` - Payment verification endpoint

## x402 Resources

- Documentation: https://x402.gitbook.io/x402
- GitHub: https://github.com/coinbase/x402
