# x402 Protocol Demo Application

A comprehensive demonstration of the [x402 payment protocol](https://x402.gitbook.io/x402) built with ElysiaJS, Bun, and React/Vite.

## 🌟 What is x402?

x402 is an open payment standard that enables services to charge for access to their APIs and content directly over HTTP using the `402 Payment Required` status code. It's designed for:

- **Programmatic payments** - Perfect for AI agents and machine-to-machine transactions
- **No accounts needed** - Direct payments without user registration
- **Crypto-native** - Fast, private, and efficient blockchain payments
- **HTTP-based** - Built on standard web protocols

## 📋 Features

This demo includes:

### Backend (ElysiaJS + Bun)
- ✅ Simple 402 Payment Required endpoint (without x402 protocol)
- ✅ x402-protected endpoints with payment verification
- ✅ Multiple pricing tiers and protected resources
- ✅ Integration with Coinbase's x402 facilitator
- ✅ Support for both testnet and mainnet

### Frontend (React + Vite)
- ✅ Interactive API endpoint tester
- ✅ Web3 wallet connection (MetaMask support)
- ✅ Visual x402 payment flow demonstration
- ✅ Real-time response viewing
- ✅ Educational explanations and code examples

## 🚀 Quick Start

### Prerequisites

- **Bun** (for backend): Install from [bun.sh](https://bun.sh/)
- **Node.js** (for frontend): Install from [nodejs.org](https://nodejs.org/)
- **MetaMask** or compatible Web3 wallet (optional, for testing)

### Backend Setup

```bash
cd backend
bun install
bun run dev
```

The API server will start on `http://localhost:3000`

### Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The React app will open on `http://localhost:5173`

## 📁 Project Structure

```
x402-demo/
├── backend/
│   ├── index.ts           # ElysiaJS server with x402 endpoints
│   ├── package.json
│   └── .env.example       # Environment configuration template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx      # Web3 wallet connection
│   │   │   ├── EndpointTester.tsx     # API testing interface
│   │   │   └── X402PaymentFlow.tsx    # Payment flow demo
│   │   ├── App.tsx
│   │   └── App.css
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Free Endpoints

- `GET /` - API information and available endpoints
- `GET /health` - Health check (always accessible)
- `GET /api/data` - Free sample data (no payment required)

### Protected Endpoints

- `GET /free` - Returns 402 Payment Required (without x402 protocol)
  - Status: 402
  - Demonstrates basic 402 response

- `GET /protected` - x402-protected endpoint
  - Status: 402 (without payment)
  - Price: 0.1 ETH
  - Returns protected content after successful payment

- `GET /api/premium` - Premium API data
  - Status: 402 (without payment)
  - Price: 0.1 ETH
  - Returns market analysis and recommendations

## 💳 How the Payment Flow Works

1. **Request** - Client requests protected resource
2. **402 Response** - Server responds with `402 Payment Required` + x402 headers
3. **Payment Prep** - Client extracts payment info from headers (price, token address, etc.)
4. **User Approval** - User approves payment via Web3 wallet
5. **Transaction** - Payment transaction submitted to blockchain
6. **Verification** - Server verifies payment through x402 facilitator
7. **Access** - Server returns protected content

## 🎯 Using the Demo

### 1. Overview Tab
Learn about x402 and the demo features

### 2. API Endpoints Tab
- Test different endpoints
- See the difference between simple 402 and x402 protocol
- View response headers and status codes
- Understand what payment is required

### 3. Payment Flow Tab
- Connect your Web3 wallet
- Walk through the complete x402 payment flow
- See how the SDK handles everything automatically
- View production code examples

## ⚙️ Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000

# x402 Configuration
FACILITATOR_URL=https://x402.coinbasecloud.io
WALLET_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# Network: mainnet or sepolia (testnet)
NETWORK=mainnet

# Price in wei (0.1 ETH = 100000000000000000 wei)
PRICE=100000000000000000
```

## 🧪 Testing

### Test Free Endpoints (No Wallet Needed)
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/data
```

### Test Protected Endpoints
```bash
curl -v http://localhost:3000/protected
curl -v http://localhost:3000/free
curl -v http://localhost:3000/api/premium
```

You should see:
- Status: `402 Payment Required`
- x402 protocol headers
- Payment information

## 📚 Resources

- [x402 Documentation](https://x402.gitbook.io/x402)
- [x402 GitHub Repository](https://github.com/coinbase/x402)
- [Quickstart for Sellers](https://x402.gitbook.io/x402/getting-started/quickstart-for-sellers)
- [Quickstart for Buyers](https://x402.gitbook.io/x402/getting-started/quickstart-for-buyers)
- [Solana x402 Guide](https://solana.com/developers/guides/getstarted/intro-to-x402)

## 🔗 NPM Packages Used

### Backend
- `elysia` - Fast and friendly TypeScript web framework
- `@x402/evm` - EVM implementation of x402 protocol
- `@x402/core` - Core x402 protocol utilities

### Frontend
- `react` - UI library
- `vite` - Build tool
- `@x402/evm` - x402 client SDK for handling payments
- `axios` - HTTP client

## 🛠️ Development

### Backend Development
```bash
cd backend
bun run dev  # Runs with hot reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Runs Vite dev server with HMR
```

## 🤝 Contributing

This is a demo application for educational purposes. For contributions to the x402 protocol itself, please visit the [main repository](https://github.com/coinbase/x402).

## 📝 License

This demo is provided as-is for educational purposes. The x402 protocol is open-source under the Apache-2.0 license.

## ⚠️ Important Notes

- This demo uses **mainnet** by default. Change to `sepolia` testnet in `.env` for testing.
- **Real payments** are required when using mainnet. Use testnet for safe testing.
- The wallet address in `.env` should be your own address to receive payments.
- Always verify transaction details before approving payments in your wallet.

## 🎓 Learning More

After this demo, explore:
- Building AI agents that autonomously pay for APIs
- Creating microservices with pay-per-request pricing
- Implementing x402 in your existing APIs
- Using x402 with different blockchains (Ethereum, Solana, Base)

## 🙏 Acknowledgments

Built with:
- [x402 Protocol](https://x402.org/) by Coinbase
- [ElysiaJS](https://elysiajs.com/)
- [Bun](https://bun.sh/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)

---

**Happy Building!** 🚀

For questions or issues, please refer to the [official x402 documentation](https://x402.gitbook.io/x402).
