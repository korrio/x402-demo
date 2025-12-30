# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

x402 protocol demo application - a payment layer for the web that enables native payments across chains and tokens.

## Architecture

Monorepo structure with separate backend and frontend:
- `/backend` - ElysiaJS API server running on Bun
- `/frontend` - React application with Vite + Tailwind CSS

## Development Commands

### Backend
```bash
cd backend
bun install          # Install dependencies
bun run dev          # Run with hot reload (port 3000)
bun test             # Run tests
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Run Vite dev server (port 5173)
npm run build        # Build for production
```

### Start Both
```bash
sh start.sh          # Start both backend and frontend
```

## Production Configuration (BASE Mainnet)

### Backend .env
```env
PORT=3000
FACILITATOR_URL=https://x402.coinbasecloud.io
WALLET_ADDRESS=0x...       # Your merchant wallet address
NETWORK=base               # Base mainnet (or base_sepolia for testnet)
PRICE=10000000000000000    # 0.01 ETH in wei
```

### Chain Configuration
- **Base Mainnet**: Chain ID 8453, RPC https://mainnet.base.org
- **Base Sepolia (Testnet)**: Chain ID 84532, RPC https://sepolia.base.org

### Payment Flow
1. Client requests protected endpoint → Server returns 402 + x402 header
2. Client parses header to get payment details (amount, recipient)
3. Client sends transaction via MetaMask
4. Client sends txHash to `/api/payment/verify` for verification
5. Server returns protected content

## API Endpoints

### Free Endpoints
- `GET /` - API information
- `GET /health` - Health check
- `GET /api/data` - Free sample data

### Protected Endpoints
- `GET /free` - Simple 402 (no x402)
- `GET /protected` - x402-protected (returns 402 + x402 header)
- `GET /api/premium` - Premium data (x402 protected)

### Payment Endpoints
- `POST /api/payment/verify` - Verify payment transaction
- `POST /api/content` - Get protected content (requires verified payment)

## x402 Resources

- Documentation: https://x402.gitbook.io/x402
- GitHub: https://github.com/coinbase/x402
