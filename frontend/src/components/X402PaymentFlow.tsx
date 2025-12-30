import React, { useState } from 'react'
import { cn } from '../lib/utils'

interface X402PaymentFlowProps {
  walletAddress: string
}

const steps = [
  { number: 1, title: 'Request', description: 'Client requests protected resource', code: "fetch('/protected')" },
  { number: 2, title: '402 Response', description: 'Server returns 402 with x402 header', code: "x402: 'version=1; network=sepolia...'" },
  { number: 3, title: 'Parse Header', description: 'Extract payment details from header', code: "parsePaymentHeader(x402Header)" },
  { number: 4, title: 'User Approve', description: 'User approves in Web3 wallet', code: "ethereum.request({ method: 'eth_sendTransaction' })" },
  { number: 5, title: 'Verify', description: 'Server verifies with facilitator', code: "fetch('/api/verify-payment')" },
  { number: 6, title: 'Access', description: 'Protected content returned', code: "{ verified: true, content: '...' }" },
]

export const X402PaymentFlow: React.FC<X402PaymentFlowProps> = ({ walletAddress }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null)

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
    <div className="border border-border rounded-lg bg-card">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">Payment Flow</h2>
        <p className="text-sm text-muted-foreground">x402 protocol step-by-step demonstration</p>
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
            <div className="p-3 bg-secondary rounded-lg text-sm text-muted-foreground">
              Connect wallet to simulate payment flow
            </div>
          )}
        </div>

        {paymentResult && (
          <div className="mt-4 p-4 bg-secondary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">Payment Successful</span>
            </div>
            <pre className="text-xs font-mono">{JSON.stringify(paymentResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
