import React, { useState, useEffect } from 'react'
import { formatAddress } from '../lib/utils'

interface WalletConnectProps {
  onWalletConnected: (address: string) => void
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletConnected }) => {
  const [address, setAddress] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>('')
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      setIsMetaMaskInstalled(true)
      const checkConnection = async () => {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          onWalletConnected(accounts[0])
        }
      }
      checkConnection()
    }
  }, [onWalletConnected])

  const connectWallet = async () => {
    setIsConnecting(true)
    setError('')
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          onWalletConnected(accounts[0])
        }
      } else {
        setError('MetaMask not installed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect')
    } finally {
      setIsConnecting(false)
    }
  }

  if (!isMetaMaskInstalled) {
    return (
      <div className="border border-border rounded-lg p-4 bg-card">
        <div className="text-sm text-muted-foreground mb-2">Wallet</div>
        <div className="text-sm text-destructive">
          MetaMask not detected. Install MetaMask to test payments.
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="text-sm text-muted-foreground mb-3">Wallet</div>
      {address ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-mono text-sm">{formatAddress(address)}</span>
          </div>
          <button
            onClick={() => {
              setAddress('')
              onWalletConnected('')
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  )
}
