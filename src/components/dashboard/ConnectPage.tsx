import React from 'react'
import { ConnectWalletButton } from '../web3/connect-button'

const ConnectPage = () => {

    const signMessage = () => {

    }
    return (
        <div className='flex pt-14 items-start md:items-center justify-center flex-col gap-6'>
            <div className='font-bold text-3xl md:text-4xl '>🔐 Connect Your Wallet</div>
            <h2 className='font-medium'>" Access the dispute resolution dashboard "</h2>

            <ul className='flex flex-col items-start md:items-center text-sm md:text-base gap-1 mb-6 text-zinc-600 dark:text-zinc-400'>
                <li>Connect your wallet to review and resolve active escrow disputes.</li>
                <li> 🧾 Access case details and evidence from both parties</li>
                <li> 💬 Communicate with involved users through dispute chat</li>
                <li> ⚖️ Make fair and unbiased decisions based on submitted data</li>


            </ul>
            <div className='max-w-md w-full'><ConnectWalletButton /></div>

        </div>
    )
}

export default ConnectPage
