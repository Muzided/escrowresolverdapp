"use client"
import { useState } from "react"
import { Button } from "../ui/button"
import { useAppKit, useAppKitAccount } from "@reown/appkit/react"
export function ConnectWalletButton() {
    const { address, isConnected } = useAppKitAccount();
    const { open, close } = useAppKit()

    const openAppkit = () => {
        open()
    }

   
    return (
        <Button
            onClick={openAppkit}
            className="w-full bg-gradient-to-r from-[#9C5F2A] to-[#9C5F2A] hover:from-[#9C5F2A] hover:to-[#9C5F2A] 
              text-white font-semibold py-6 rounded-xl 
              shadow-md hover:shadow-lg shadow-[#9C5F2A]/30 hover:shadow-[#9C5F2A]/40
              dark:shadow-lg dark:hover:shadow-lg dark:shadow-[#9C5F2A]/30 dark:hover:shadow-[#9C5F2A]/40 
              transition-all duration-300"
        >
            {isConnected ?`${address?.slice(0, 8)}...${address?.slice(-7)}` : 'Connect Wallet'}
        </Button>
    )

}