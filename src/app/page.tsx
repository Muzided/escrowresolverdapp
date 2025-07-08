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
import Main from "./Main"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
     <Main/>
    </Suspense>
  );
}

