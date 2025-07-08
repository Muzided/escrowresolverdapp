"use client"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Suspense } from 'react'

import { useEffect, useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ResolverStats } from "@/components/dashboard/profile/resolver-stats"
import { TransactionsTab } from "@/components/dashboard/transaction-tab"
import { CreateTab } from "@/components/dashboard/create-tab"
import { DisputeResolution } from "@/components/dashboard/dispute-queue/dispute-resolution"
import ConnectPage from "@/components/dashboard/ConnectPage"
import { useAppKitAccount } from "@reown/appkit/react"
import DaoTab from "@/components/dashboard/doa-tab"
import { useUser } from "@/context/userContext"
import { OngoingDisputes } from "@/components/resolutions/ongoing-disputes"

import ResolvedDisputes from "@/components/resolved-disputes/resolved-disputes"

export default function Main() {
  const [isClient, setIsClient] = useState(false)
  //const [activeTab, setActiveTab] = useState("dispute")
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { isAuthenticated} = useUser()
  const { address, isConnected } = useAppKitAccount();
  // ─── URL helpers ─────────────────────────────────────────────
  const router = useRouter ()
  const pathname = usePathname ()                 // e.g. "/dashboard"
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") ?? "dispute"

  useEffect(() => {
    setIsClient(true) // Ensures document-related code runs only on the client
  }, [])

  if (!isClient) return null // Prevents SSR issues

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen)
  }
  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", tab)
    router.replace(`${pathname}?${params}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-50 to-white dark:bg-black dark:from-black dark:to-black">
      <Header toggleMobileNav={toggleMobileNav} />

      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab)
            setIsMobileNavOpen(false)
          }}
          isMobileNavOpen={isMobileNavOpen}
        />

        {/* Main content area with left padding to account for fixed sidebar */}
        <main className="flex-1 overflow-auto p-4 md:p-6 md:ml-64">
          <Suspense fallback={<div>Loading...</div>}>
            {!isAuthenticated? 
              <ConnectPage/>
               :
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* <DashboardHeader activeTab={activeTab} /> */}

                <TabsContent value="profilestats" className="mt-0">
               
                  <ResolverStats />
                </TabsContent>

                <TabsContent value="ongoing-disputes" className="mt-0">
                <OngoingDisputes/>
                </TabsContent>

                
                <TabsContent value="resolved-disputes" className="mt-0">
               <ResolvedDisputes/>
                </TabsContent>
            {/* 
                <TabsContent value="create" className="mt-0">
                  <CreateTab />
                </TabsContent> */}
                <TabsContent value="dispute" className="mt-0">
                 <DisputeResolution/>
                </TabsContent>
                {/* <TabsContent value="history" className="mt-0">
                <TransactionsTab />
                </TabsContent> */}
                {/* <TabsContent value="history" className="mt-0">
               <DaoTab/>
                </TabsContent> */}
              </Tabs>
            }
          </Suspense>
        </main>
      </div>

      {/* Overlay for mobile nav */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm dark:bg-black/50 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
    </div>
  )
}

