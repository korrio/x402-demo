import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'

// Environment configuration
const PORT = parseInt(process.env.PORT || '3000')
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://x402.coinbasecloud.io'
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
const NETWORK = process.env.NETWORK || 'sepolia'
const PRICE = process.env.PRICE || '100000000000000000'

// x402 payment header template (manual construction for demo)
const createX402Header = (address: string, amount: string) => {
  return `version=1; network=${NETWORK}; address=${address}; amount=${amount}; asset=0x0000000000000000000000000000000000000000; facilitator=${FACILITATOR_URL}`
}

// Parse x402 header (basic implementation for demo)
const parseX402Header = (header: string) => {
  const result: Record<string, string> = {}
  header.split(';').forEach(part => {
    const [key, value] = part.trim().split('=')
    if (key && value) result[key.trim()] = value.trim()
  })
  return result
}

// Create ElysiaJS app
const app = new Elysia()
  .use(cors())
  .decorate('env', { PORT, FACILITATOR_URL, WALLET_ADDRESS, NETWORK, PRICE })
  .get('/', () => ({
    message: 'x402 Protocol Demo API',
    version: '1.0.0',
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
      }
    },
    x402Info: {
      network: NETWORK,
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

  // Verify payment endpoint (for x402 client)
  .get('/api/verify-payment', async ({ request }) => {
    const paymentHeaderValue = request.headers.get('x402')

    if (!paymentHeaderValue) {
      return new Response(JSON.stringify({
        error: 'No payment header provided'
      }), {
        status: 402,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Parse the payment header
    const paymentInfo = parseX402Header(paymentHeaderValue)

    // In a real implementation, you would verify the payment with the facilitator
    // For demo purposes, we'll accept the payment header
    return {
      verified: true,
      paymentInfo,
      content: 'Premium content after payment verification!'
    }
  }, {
    response: {
      402: t.Object({
        error: t.String()
      }),
      200: t.Object({
        verified: t.Boolean(),
        paymentInfo: t.Any(),
        content: t.String()
      })
    }
  })

  .listen(PORT, ({ hostname, port }) => {
    console.log(`🦊 x402 Demo API running at http://${hostname}:${port}`)
    console.log(`   Network: ${NETWORK}`)
    console.log(`   Price: ${PRICE} wei`)
  })

export type App = typeof app
