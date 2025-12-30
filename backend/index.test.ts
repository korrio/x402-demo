import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

// Test configuration
const PORT = 3001
const WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
const NETWORK = 'sepolia'
const PRICE = '100000000000000000'

// Create test app
const app = new Elysia()
  .use(cors())
  .decorate('env', { PORT, WALLET_ADDRESS, NETWORK, PRICE })
  .get('/', () => ({
    message: 'x402 Protocol Demo API',
    version: '1.0.0',
    endpoints: {
      free: { '/': 'API information', '/health': 'Health check', '/api/data': 'Free sample data' },
      protected: { '/free': '402 Payment Required', '/protected': 'x402-protected endpoint', '/api/premium': 'Premium API data' }
    }
  }))
  .get('/health', () => ({
    status: 'healthy',
    timestamp: new Date().toISOString()
  }))
  .get('/api/data', () => ({
    message: 'This is free data - no payment required!',
    data: { id: 1, content: 'Hello from the free API!', timestamp: new Date().toISOString() }
  }))
  .get('/free', () => {
    return new Response('Payment Required', {
      status: 402,
      headers: { 'Content-Type': 'text/plain', 'WWW-Authenticate': 'Payment Required' }
    })
  })
  .get('/protected', () => {
    const x402Header = `version=1; network=${NETWORK}; address=${WALLET_ADDRESS}; amount=${PRICE}; asset=0x0000000000000000000000000000000000000000; facilitator=https://x402.coinbasecloud.io`
    return new Response('Protected content - payment verified!', {
      status: 402,
      headers: { 'Content-Type': 'text/plain', 'x402': x402Header }
    })
  })
  .get('/api/premium', () => {
    const x402Header = `version=1; network=${NETWORK}; address=${WALLET_ADDRESS}; amount=${PRICE}; asset=0x0000000000000000000000000000000000000000; facilitator=https://x402.coinbasecloud.io`
    return new Response(JSON.stringify({
      message: 'Premium data - payment required',
      data: { marketAnalysis: 'Bullish', recommendations: ['HODL'] }
    }), {
      status: 402,
      headers: { 'Content-Type': 'application/json', 'x402': x402Header }
    })
  })
  .get('/api/verify-payment', async ({ request }) => {
    const paymentHeaderValue = request.headers.get('x402')
    if (!paymentHeaderValue) {
      return new Response(JSON.stringify({ error: 'No payment header provided' }), {
        status: 402,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    return { verified: true, content: 'Premium content after payment verification!' }
  })

describe('x402 Demo API Tests', () => {
  let server: ReturnType<typeof app.listen>

  beforeAll(() => {
    server = app.listen(PORT)
  })

  afterAll(() => {
    server.stop()
  })

  describe('Root Endpoint', () => {
    it('should return API information', async () => {
      const response = await fetch(`http://localhost:${PORT}/`)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('x402 Protocol Demo API')
      expect(data.version).toBe('1.0.0')
      expect(data.endpoints).toBeDefined()
    })
  })

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`http://localhost:${PORT}/health`)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.status).toBe('healthy')
      expect(data.timestamp).toBeDefined()
    })
  })

  describe('Free Data Endpoint', () => {
    it('should return free data without payment', async () => {
      const response = await fetch(`http://localhost:${PORT}/api/data`)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('This is free data - no payment required!')
      expect(data.data).toBeDefined()
      expect(data.data.id).toBe(1)
    })
  })

  describe('Simple 402 Endpoint', () => {
    it('should return 402 status without x402 header', async () => {
      const response = await fetch(`http://localhost:${PORT}/free`)
      expect(response.status).toBe(402)
      expect(response.headers.get('WWW-Authenticate')).toBe('Payment Required')
    })
  })

  describe('x402 Protected Endpoint', () => {
    it('should return 402 with x402 header', async () => {
      const response = await fetch(`http://localhost:${PORT}/protected`)
      expect(response.status).toBe(402)
      const x402Header = response.headers.get('x402')
      expect(x402Header).toBeDefined()
      expect(x402Header).toContain('network=sepolia')
      expect(x402Header).toContain(`address=${WALLET_ADDRESS}`)
    })
  })

  describe('Premium API Endpoint', () => {
    it('should return 402 with x402 header for premium data', async () => {
      const response = await fetch(`http://localhost:${PORT}/api/premium`)
      expect(response.status).toBe(402)
      const x402Header = response.headers.get('x402')
      expect(x402Header).toBeDefined()
      expect(response.headers.get('Content-Type')).toBe('application/json')
    })

    it('should return JSON body with premium data info', async () => {
      const response = await fetch(`http://localhost:${PORT}/api/premium`)
      expect(response.status).toBe(402)
      const data = await response.json()
      expect(data.message).toBe('Premium data - payment required')
      expect(data.data).toBeDefined()
      expect(data.data.marketAnalysis).toBeDefined()
    })
  })

  describe('Payment Verification Endpoint', () => {
    it('should return 402 when no x402 header provided', async () => {
      const response = await fetch(`http://localhost:${PORT}/api/verify-payment`)
      expect(response.status).toBe(402)
      const data = await response.json()
      expect(data.error).toBe('No payment header provided')
    })

    it('should return verified content when x402 header provided', async () => {
      const x402Header = `version=1; network=${NETWORK}; address=${WALLET_ADDRESS}; amount=${PRICE}; asset=0x0000000000000000000000000000000000000000; facilitator=https://x402.coinbasecloud.io`
      const response = await fetch(`http://localhost:${PORT}/api/verify-payment`, {
        headers: { 'x402': x402Header }
      })
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.verified).toBe(true)
      expect(data.content).toBe('Premium content after payment verification!')
    })
  })
})
