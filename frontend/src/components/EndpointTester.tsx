import React, { useState } from 'react'
import axios from 'axios'
import { cn } from '../lib/utils'

interface EndpointTesterProps {
  walletAddress: string
}

interface Endpoint {
  name: string
  url: string
  method: string
  type: 'free' | 'protected'
  description: string
}

const endpoints: Endpoint[] = [
  { name: 'API Info', url: '/', method: 'GET', type: 'free', description: 'API information' },
  { name: 'Health', url: '/health', method: 'GET', type: 'free', description: 'Health check' },
  { name: 'Free Data', url: '/api/data', method: 'GET', type: 'free', description: 'Free sample data' },
  { name: 'Basic 402', url: '/free', method: 'GET', type: 'protected', description: 'Simple 402 response' },
  { name: 'Protected', url: '/protected', method: 'GET', type: 'protected', description: 'x402 protected' },
  { name: 'Premium', url: '/api/premium', method: 'GET', type: 'protected', description: 'Premium data' },
]

export const EndpointTester: React.FC<EndpointTesterProps> = ({ walletAddress }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(endpoints[0])
  const [response, setResponse] = useState<any>(null)
  const [status, setStatus] = useState<number | null>(null)
  const [headers, setHeaders] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const testEndpoint = async () => {
    setLoading(true)
    setResponse(null)
    setStatus(null)
    setHeaders({})

    try {
      const config: any = {
        method: 'get',
        url: `http://localhost:3000${selectedEndpoint.url}`,
        validateStatus: () => true,
      }

      if (walletAddress && selectedEndpoint.type === 'protected') {
        config.headers = {
          'x402': `version=1; network=sepolia; address=${walletAddress}; amount=100000000000000000; asset=0x0000000000000000000000000000000000000000; facilitator=https://x402.coinbasecloud.io`
        }
      }

      const res = await axios(config)
      setStatus(res.status)
      setHeaders(res.headers as Record<string, string>)
      setResponse(res.data)
    } catch {
      setResponse({ error: 'Failed to fetch' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">Endpoints</h2>
        <p className="text-sm text-muted-foreground">Click an endpoint to select, then test</p>
      </div>

      <div className="divide-y divide-border">
        {endpoints.map((endpoint) => (
          <button
            key={endpoint.url}
            onClick={() => setSelectedEndpoint(endpoint)}
            className={cn(
              "w-full p-4 text-left hover:bg-muted/50 transition-colors",
              selectedEndpoint.url === endpoint.url && "bg-muted"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium font-mono",
                  endpoint.method === 'GET' ? "bg-secondary text-secondary-foreground" : "bg-secondary text-secondary-foreground"
                )}>
                  {endpoint.method}
                </span>
                <span className="font-mono text-sm">{endpoint.url}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{endpoint.description}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium",
                  endpoint.type === 'free' ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                )}>
                  {endpoint.type}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={testEndpoint}
          disabled={loading}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Testing...' : `Test ${selectedEndpoint.url}`}
        </button>
      </div>

      {status !== null && (
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-medium font-mono",
              status === 200 ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
            )}>
              {status}
            </span>
          </div>

          {Object.keys(headers).length > 0 && (
            <div className="mb-3">
              <div className="text-sm text-muted-foreground mb-1">Headers</div>
              <pre className="bg-secondary rounded-md p-3 text-xs font-mono overflow-x-auto">
                {JSON.stringify(headers, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <div className="text-sm text-muted-foreground mb-1">Response</div>
            <pre className="bg-secondary rounded-md p-3 text-xs font-mono overflow-x-auto">
              {typeof response === 'object' ? JSON.stringify(response, null, 2) : response}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
