import React, { useState } from 'react'
import { WalletConnect } from './components/WalletConnect'
import { EndpointTester } from './components/EndpointTester'
import { X402PaymentFlow } from './components/X402PaymentFlow'
import { cn } from './lib/utils'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'flow'>('overview')
  const [walletAddress, setWalletAddress] = useState<string>('')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold">x402 Protocol Demo</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-1 mb-6 border-b border-border pb-1">
          {(['overview', 'endpoints', 'flow'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t-md transition-colors",
                activeTab === tab
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          <WalletConnect onWalletConnected={setWalletAddress} />

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="border border-border rounded-lg bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">What is x402?</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  x402 is an open payment standard that enables services to charge for API access
                  directly over HTTP using the <code className="bg-secondary px-1 rounded">402 Payment Required</code> status code.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'No Accounts', value: 'Direct payments' },
                    { label: 'Crypto-Native', value: 'Fast & private' },
                    { label: 'HTTP-Based', value: 'Standard protocols' },
                    { label: 'Multi-Chain', value: 'EVM & Solana' },
                  ].map((item) => (
                    <div key={item.label} className="bg-secondary rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                      <div className="text-sm font-medium">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-border rounded-lg bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Configuration</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Network', value: 'Sepolia' },
                    { label: 'Price', value: '0.1 ETH' },
                    { label: 'API', value: 'localhost:3000' },
                    { label: 'Frontend', value: 'localhost:5173' },
                  ].map((item) => (
                    <div key={item.label} className="bg-secondary rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                      <div className="text-sm font-medium font-mono">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-border rounded-lg bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Resources</h2>
                <div className="space-y-2">
                  {[
                    { label: 'Documentation', url: 'https://x402.gitbook.io/x402' },
                    { label: 'GitHub', url: 'https://github.com/coinbase/x402' },
                  ].map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">{link.label}</span>
                      <span className="text-xs text-muted-foreground">→</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && <EndpointTester walletAddress={walletAddress} />}
          {activeTab === 'flow' && <X402PaymentFlow walletAddress={walletAddress} />}
        </div>
      </main>
    </div>
  )
}

export default App
