// hooks/use-wallet.ts
import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from "next/navigation"
export function useNavigateTab() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const goToTab = (tab: string) => {
        const params = new URLSearchParams(searchParams)
        params.set("tab", tab)
        router.replace(`${pathname}?${params}`, { scroll: false })
    }



    return { goToTab }
}