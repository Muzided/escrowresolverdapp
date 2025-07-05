'use client'

import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, arbitrum, sepolia } from '@reown/appkit/networks'

// 1. Get projectId at https://cloud.reown.com
const projectId = '59654aa00cd1d9ba41487417f2232a10'

// 2. Create a metadata object
const metadata = {
  name: 'resdash',
  description: 'AppKit Example',
  url: 'http://localhost:3000/', // origin must match your domain & subdomain
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}

// 3. Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [sepolia],
  projectId,
  features: {
    email:false,
    connectMethodsOrder: ['wallet'],
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

import { ReactNode } from 'react';

export function AppKit({ children }: { children: ReactNode }) {
  return (  
    <>
      {children}
      </>
  )
}