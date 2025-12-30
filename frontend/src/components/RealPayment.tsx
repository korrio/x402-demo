import React, { useState, useEffect } from 'react'
import { cn, formatAddress } from '../lib/utils'
import axios from 'axios'

// BASE Mainnet configuration
const BASE_MAINNET = {
  chainId: '0x2105', // 8453 in hex
  chainName: 'Base',
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  }
}

interface PaymentState {
  step: 'idle' | 'network' | 'approve' | 'paying' | 'verifying' | 'success' | 'error'
  txHash?: string
  error?: string
  content?: any
}

interface RealPaymentProps {
  walletAddress: string
  x402Header: string
  merchantAddress: string
  amount: string
  endpoint: string
}

export const RealPayment: React.FC<RealPaymentProps> = ({
  walletAddress,
  x402Header,
  merchantAddress,
  amount,
  endpoint
}) => {
  const [state, setState] = useState<PaymentState>({ step: 'idle' })
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      setIsMetaMaskInstalled(true)
      checkNetwork()
    }
  }, [walletAddress])

  const checkNetwork = async () => {
    if (!walletAddress) return
    try {
      const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' })
      setIsCorrectNetwork(chainId === BASE_MAINNET.chainId)
    } catch {
      setIsCorrectNetwork(false)
    }
  }

  const switchToBase = async () => {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_MAINNET.chainId }]
      })
      setIsCorrectNetwork(true)
    } catch (err: any) {
      // Chain not added, try to add it
      if (err.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_MAINNET]
          })
          setIsCorrectNetwork(true)
        } catch (addErr) {
          setState({ step: 'error', error: 'Failed to add Base network' })
        }
      } else {
        setState({ step: 'error', error: 'Failed to switch to Base network' })
      }
    }
  }

  const makePayment = async () => {
    setState({ step: 'network' })

    // Switch to Base if needed
    if (!isCorrectNetwork) {
      await switchToBase()
      if (!isCorrectNetwork && state.step === 'error') return
    }

    setState({ step: 'approve' })

    try {
      // Send transaction
      const txHash = await (window as any).ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: merchantAddress,
          value: amount,
          data: '0x'
        }]
      })

      setState({ step: 'paying', txHash })

      // Wait for transaction confirmation (3-4 blocks on Base)
      await new Promise(resolve => setTimeout(resolve, 5000))

      setState({ step: 'verifying' })

      // Verify payment with server
      const response = await axios.post('http://localhost:3000/api/payment/verify', {
        txHash,
        paymentHeader: x402Header
      })

      if (response.data.verified) {
        // Get protected content
        const contentResponse = await axios.post('http://localhost:3000/api/content', {
          txHash,
          paymentHeader: x402Header
        })

        setState({ step: 'success', content: contentResponse.data })
      } else {
        setState({ step: 'error', error: 'Payment verification failed' })
      }
    } catch (err: any) {
      setState({ step: 'error', error: err.message || 'Payment failed' })
    }
  }

  if (!isMetaMaskInstalled) {
    return (
      <div className="border border-border rounded-lg bg-card p-4">
        <div className="text-sm text-muted-foreground mb-2">Real Payment</div>
        <div className="text-sm text-destructive">
          MetaMask not installed
        </div>
      </div>
    )
  }

  if (!walletAddress) {
    return (
      <div className="border border-border rounded-lg bg-card p-4">
        <div className="text-sm text-muted-foreground mb-2">Real Payment</div>
        <div className="text-sm text-muted-foreground">
          Connect wallet to make real payment on Base
        </div>
      </div>
    )
  }

  const formatAmount = (wei: string) => {
    const eth = parseInt(wei) / 1e18
    return `${eth.toFixed(6)} ETH`
  }

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">Real Payment</h2>
        <p className="text-sm text-muted-foreground">Pay on Base mainnet to access protected content</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Payment Info */}
        <div className="bg-secondary rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network</span>
            <span className="font-medium flex items-center gap-2">
              Base
              {isCorrectNetwork ? (
                <span className="w-2 h-2 rounded-full bg-primary" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-destructive" />
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium font-mono">{formatAmount(amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Recipient</span>
            <span className="font-medium font-mono">{formatAddress(merchantAddress)}</span>
          </div>
        </div>

        {/* Status */}
        {state.step !== 'idle' && (
          <div className="bg-secondary rounded-lg p-4">
            {state.step === 'network' && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Switching to Base network...</span>
              </div>
            )}

            {state.step === 'approve' && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Confirm transaction in MetaMask...</span>
              </div>
            )}

            {state.step === 'paying' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Processing payment...</span>
                </div>
                {state.txHash && (
                  <div className="text-xs text-muted-foreground font-mono">
                    Tx: {state.txHash.slice(0, 10)}...{state.txHash.slice(-8)}
                  </div>
                )}
              </div>
            )}

            {state.step === 'verifying' && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Verifying payment on server...</span>
              </div>
            )}

            {state.step === 'success' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span className="text-lg">✓</span>
                  <span className="font-medium">Payment successful!</span>
                </div>
                {state.txHash && (
                  <a
                    href={`https://basescan.org/tx/${state.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    View on Basescan →
                  </a>
                )}
              </div>
            )}

            {state.step === 'error' && (
              <div className="text-sm text-destructive">
                Error: {state.error}
              </div>
            )}
          </div>
        )}

        {/* Protected Content */}
        {state.step === 'success' && state.content && (
          <div className="bg-primary text-primary-foreground rounded-lg p-4">
            <div className="text-sm font-medium mb-2">Protected Content</div>
            <pre className="text-xs font-mono overflow-auto">
              {JSON.stringify(state.content, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions */}
        {state.step === 'idle' && (
          <button
            onClick={makePayment}
            disabled={!walletAddress || !isCorrectNetwork}
            className={cn(
              "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors",
              isCorrectNetwork
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {isCorrectNetwork ? `Pay ${formatAmount(amount)}` : 'Switch to Base'}
          </button>
        )}

        {state.step === 'success' && (
          <button
            onClick={() => setState({ step: 'idle' })}
            className="w-full py-2 px-4 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Make Another Payment
          </button>
        )}
      </div>
    </div>
  )
}
