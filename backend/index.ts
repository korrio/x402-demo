import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'

// Environment configuration
const PORT = parseInt(process.env.PORT || '3000')
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://x402.coinbasecloud.io'
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
const NETWORK = process.env.NETWORK || 'base'
const PRICE = process.env.PRICE || '100000000000000000' // 0.1 ETH
const CHAIN_ID = NETWORK === 'base' ? 8453 : 84532 // 8453 = Base Mainnet, 84532 = Base Sepolia

// x402 payment header format for BASE
const createX402Header = (address: string, amount: string) => {
  return `version=1; network=${NETWORK}; address=${address}; amount=${amount}; asset=0x0000000000000000000000000000000000000000; facilitator=${FACILITATOR_URL}`
}

// Parse x402 header
const parseX402Header = (header: string) => {
  const result: Record<string, string> = {}
  header.split(';').forEach(part => {
    const [key, value] = part.trim().split('=')
    if (key && value) result[key.trim()] = value.trim()
  })
  return result
}

// Verified payments cache (in production, use Redis/database)
const verifiedPayments = new Map<string, { timestamp: number; txHash: string }>()

// Create ElysiaJS app
const app = new Elysia()
  .use(cors())
  .decorate('env', { PORT, FACILITATOR_URL, WALLET_ADDRESS, NETWORK, PRICE, CHAIN_ID })
  .get('/', () => ({
    message: 'x402 Protocol Demo API',
    version: '1.0.0',
    chain: {
      id: CHAIN_ID,
      name: NETWORK === 'base' ? 'Base Mainnet' : 'Base Sepolia',
      rpc: NETWORK === 'base'
        ? 'https://mainnet.base.org'
        : 'https://sepolia.base.org'
    },
    endpoints: {
      free: {
        '/': 'API information',
        '/health': 'Health check',
        '/api/data': 'Free sample data'
      },
      protected: {
        '/free': '402 Payment Required (basic, no x402)',
        '/protected': 'x402-protected endpoint',
        '/api/premium': 'Premium API data (x402 protected)'
      },
      payment: {
        '/api/payment/verify': 'Verify payment transaction'
      }
    },
    x402Info: {
      network: NETWORK,
      chainId: CHAIN_ID,
      price: PRICE,
      walletAddress: WALLET_ADDRESS,
      facilitator: FACILITATOR_URL
    }
  }))
  .get('/health', () => ({
    status: 'healthy',
    timestamp: new Date().toISOString()
  }))
  .get('/api/data', () => ({
    message: 'This is free data - no payment required!',
    data: {
      id: 1,
      content: 'Hello from the free API!',
      timestamp: new Date().toISOString()
    }
  }))

  // Simple 402 endpoint (without x402 protocol)
  .get('/free', () => {
    return new Response('Payment Required', {
      status: 402,
      headers: {
        'Content-Type': 'text/plain',
        'WWW-Authenticate': 'Payment Required'
      }
    })
  })

  // x402-protected endpoint
  .get('/protected', () => {
    const paymentHeader = createX402Header(WALLET_ADDRESS, PRICE)
    return new Response('Protected content - payment verified!', {
      status: 402,
      headers: {
        'Content-Type': 'text/plain',
        'x402': paymentHeader
      }
    })
  })

  // Premium API data endpoint
  .get('/api/premium', () => {
    const paymentHeader = createX402Header(WALLET_ADDRESS, PRICE)
    return new Response(JSON.stringify({
      message: 'Premium data - payment required',
      data: {
        marketAnalysis: 'Bullish outlook for the next quarter',
        recommendations: ['HODL', 'DCA', 'Research'],
        timestamp: new Date().toISOString()
      }
    }), {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'x402': paymentHeader
      }
    })
  })

  // Verify payment endpoint
  .post('/api/payment/verify', async ({ request }) => {
    const body = await request.json()
    const { txHash, paymentHeader } = body

    if (!txHash || !paymentHeader) {
      return new Response(JSON.stringify({
        error: 'Missing txHash or paymentHeader'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Parse payment header to verify amount and recipient
    const paymentInfo = parseX402Header(paymentHeader)

    // In production, you would:
    // 1. Query the blockchain to verify the transaction
    // 2. Check txHash exists and is confirmed
    // 3. Verify amount matches
    // 4. Verify recipient is correct
    // 5. Check transaction is not already used

    // For demo, we cache the transaction
    if (verifiedPayments.has(txHash)) {
      return {
        verified: true,
        alreadyUsed: true,
        message: 'Transaction already verified'
      }
    }

    // Store verified payment (with expiry)
    verifiedPayments.set(txHash, {
      timestamp: Date.now(),
      txHash
    })

    // Clean up old entries every 100 verifications
    if (verifiedPayments.size > 100) {
      const oneHourAgo = Date.now() - 3600000
      for (const [hash, data] of verifiedPayments) {
        if (data.timestamp < oneHourAgo) {
          verifiedPayments.delete(hash)
        }
      }
    }

    return {
      verified: true,
      paymentInfo: {
        network: paymentInfo.network,
        amount: paymentInfo.amount,
        asset: paymentInfo.asset,
        facilitator: paymentInfo.facilitator
      },
      transactionHash: txHash,
      message: 'Payment verified successfully'
    }
  }, {
    body: t.Object({
      txHash: t.String(),
      paymentHeader: t.String()
    })
  })

  // Get protected content (requires valid payment proof)
  .post('/api/content', async ({ request }) => {
    const body = await request.json()
    const { txHash, paymentHeader } = body

    if (!txHash || !paymentHeader) {
      return new Response(JSON.stringify({
        error: 'Payment required',
        x402: createX402Header(WALLET_ADDRESS, PRICE)
      }), {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'x402': createX402Header(WALLET_ADDRESS, PRICE)
        }
      })
    }

    // Verify payment
    if (!verifiedPayments.has(txHash)) {
      return new Response(JSON.stringify({
        error: 'Invalid or unverified payment',
        x402: createX402Header(WALLET_ADDRESS, PRICE)
      }), {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'x402': createX402Header(WALLET_ADDRESS, PRICE)
        }
      })
    }

    // Return protected content
    return {
      content: 'This is premium protected content!',
      data: {
        secretValue: 'The answer is 42',
        marketAnalysis: 'Bullish on BASE ecosystem',
        timestamp: new Date().toISOString()
      }
    }
  }, {
    body: t.Object({
      txHash: t.Optional(t.String()),
      paymentHeader: t.Optional(t.String())
    })
  })

  .listen(PORT, ({ hostname, port }) => {
    console.log(`🦊 x402 Demo API running at http://${hostname}:${port}`)
    console.log(`   Network: ${NETWORK} (Chain ID: ${CHAIN_ID})`)
    console.log(`   Price: ${PRICE} wei`)
    console.log(`   Merchant: ${WALLET_ADDRESS}`)
  })

export type App = typeof app
