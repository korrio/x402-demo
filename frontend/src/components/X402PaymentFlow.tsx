import React, { useState, useEffect } from 'react'
import { cn, formatAddress } from '../lib/utils'
import { RealPayment } from './RealPayment'

const steps = [
  { number: 1, title: 'Request', description: 'Client requests protected resource', code: "fetch('/api/premium')" },
  { number: 2, title: '402 Response', description: 'Server returns 402 with x402 header', code: "x402: 'version=1; network=base...'" },
  { number: 3, title: 'Parse Header', description: 'Extract payment details', code: "parsePaymentHeader(x402Header)" },
  { number: 4, title: 'User Approve', description: 'User approves in MetaMask', code: "eth_sendTransaction" },
  { number: 5, title: 'Verify', description: 'Server verifies on-chain', code: "POST /api/payment/verify" },
  { number: 6, title: 'Access', description: 'Protected content returned', code: "{ content: 'secret data' }" },
]

interface X402PaymentFlowProps {
  walletAddress: string
}

export const X402PaymentFlow: React.FC<X402PaymentFlowProps> = ({ walletAddress }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const [mode, setMode] = useState<'simulate' | 'real'>('simulate')
  const [x402Header, setX402Header] = useState('')
  const [merchantAddress, setMerchantAddress] = useState('')
  const [amount, setAmount] = useState('')

  // Fetch x402 header from protected endpoint
  useEffect(() => {
    const fetchX402Header = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/premium')
        const header = res.headers.get('x402')
        if (header) {
          setX402Header(header)
          // Parse header to get details
          const parts = header.split(';')
          const addrPart = parts.find((p: string) => p.trim().startsWith('address='))
          const amtPart = parts.find((p: string) => p.trim().startsWith('amount='))
          if (addrPart) setMerchantAddress(addrPart.split('=')[1].trim())
          if (amtPart) setAmount(amtPart.split('=')[1].trim())
        }
      } catch (e) {
        // Backend might not be running
      }
    }
    fetchX402Header()
  }, [])

  const simulatePayment = async () => {
    setIsProcessing(true)
    setCurrentStep(0)
    setPaymentResult(null)

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCurrentStep(i + 1)
    }

    setPaymentResult({ success: true, content: 'Protected data revealed!' })
    setIsProcessing(false)
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-secondary rounded-lg w-fit">
        <button
          onClick={() => setMode('simulate')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            mode === 'simulate' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          )}
        >
          Simulation
        </button>
        <button
          onClick={() => setMode('real')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            mode === 'real' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          )}
        >
          Real Payment
        </button>
      </div>

      {mode === 'simulate' && (
        <>
          <div className="border border-border rounded-lg bg-card">
            <div className="border-b border-border p-4">
              <h2 className="text-lg font-semibold">Payment Flow Simulation</h2>
              <p className="text-sm text-muted-foreground">Step-by-step demonstration of x402 protocol</p>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={cn(
                      "flex items-start gap-4 p-3 rounded-lg transition-colors",
                      currentStep >= step.number ? "bg-secondary" : "bg-transparent"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                      currentStep >= step.number ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    )}>
                      {step.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{step.title}</div>
                      <div className="text-xs text-muted-foreground mb-1">{step.description}</div>
                      <pre className="bg-secondary rounded p-2 text-xs font-mono overflow-x-auto">
                        {step.code}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                {walletAddress ? (
                  <button
                    onClick={simulatePayment}
                    disabled={isProcessing}
                    className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Simulate Payment Flow'}
                  </button>
                ) : (
                  <div className="p-3 bg-secondary rounded-lg text-sm text-muted-foreground text-center">
                    Connect wallet to simulate
                  </div>
                )}
              </div>

              {paymentResult && (
                <div className="mt-4 p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium">Simulation Complete</span>
                  </div>
                  <pre className="text-xs font-mono">{JSON.stringify(paymentResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {mode === 'real' && (
        <>
          {/* x402 Header Info */}
          <div className="border border-border rounded-lg bg-card p-4">
            <h2 className="text-lg font-semibold mb-2">x402 Payment Request</h2>
            {x402Header ? (
              <div className="bg-secondary rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">x402 Header</div>
                <pre className="text-xs font-mono break-all">{x402Header}</pre>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Backend not running. Start the server to see payment details.
              </p>
            )}
          </div>

          {/* Real Payment Component */}
          {walletAddress && x402Header && merchantAddress && amount && (
            <RealPayment
              walletAddress={walletAddress}
              x402Header={x402Header}
              merchantAddress={merchantAddress}
              amount={amount}
              endpoint="/api/premium"
            />
          )}

          {!walletAddress && (
            <div className="border border-border rounded-lg bg-card p-4">
              <div className="text-sm text-muted-foreground text-center">
                Connect wallet to make real payment on Base mainnet
              </div>
            </div>
          )}

          {/* Payment Flow Steps */}
          <div className="border border-border rounded-lg bg-card">
            <div className="border-b border-border p-4">
              <h2 className="text-lg font-semibold">Real Payment Flow</h2>
              <p className="text-sm text-muted-foreground">What happens during a real payment</p>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="flex items-start gap-4 p-3 rounded-lg bg-secondary"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 bg-primary text-primary-foreground">
                      {step.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{step.title}</div>
                      <div className="text-xs text-muted-foreground mb-1">{step.description}</div>
                      <pre className="bg-background rounded p-2 text-xs font-mono overflow-x-auto">
                        {step.code}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-secondary rounded-lg p-4 text-sm text-muted-foreground">
            <strong>Note:</strong> This will make a real transaction on Base mainnet.
            Make sure you have ETH on Base and understand that this is a real payment.
          </div>
        </>
      )}
    </div>
  )
}
