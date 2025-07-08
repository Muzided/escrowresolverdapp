import { StatsCard } from "@/components/dashboard/profile/components/stats-card"

import { useEffect, useState } from "react"
import { disputeStats, disputeResolutionHistory } from "../../../../public/Data/Ecsrows"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { useQuery } from "@tanstack/react-query"
import { getResolverStats } from "@/services/Api/resolver/resolver"
import { resolverStats } from "@/types/resolver"
import { useAppKitAccount } from "@reown/appkit/react"
import { ResolutionHistoryChart } from "./components/resolution-chart"
import { useFactory } from "@/Hooks/useFactory"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export function ResolverStats() {
  const { address } = useAppKitAccount();
  const [maxAdoptionLimit, setMaxAdoptionLimit] = useState(0);
  const { fetchMaxAdoptionLimit } = useFactory()
  const { data: profileStats, isLoading, error } = useQuery<resolverStats>({
    queryKey: ['profile-stats'],
    queryFn: async () => {
      const response = await getResolverStats();
      return response.data;
    },
    enabled: !!address,
  });
  useEffect(() => {
    retrevingMaxAdoptionLimit()
  }, [])

  const retrevingMaxAdoptionLimit = async () => {
    try {
      const res = await fetchMaxAdoptionLimit()
      console.log("maxxinglimit",res)
      setMaxAdoptionLimit(res)
    } catch (error) {
      console.log("error while fetching", error)
    }
  }
  console.log("prfile-state", profileStats)
  return (
    <div className="space-y-8">
      {/* Stats Cards Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <>
            <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Disputes Resolved"
              description="Successfully resolved disputes"
              value={profileStats?.stats.resolved.toString()}
            />
            <StatsCard
              title=" Adopted Disputes"
              description={`${profileStats?.stats.ongoing}/${disputeStats.maxDailyLimit} adopted `}
              value={`${profileStats?.stats.ongoing}/${maxAdoptionLimit}`}
            />
          </>
        )}
      </div>

      {/* Dispute Resolution Graph */}
      {!isLoading && <ResolutionHistoryChart />}

    </div>
  )
}

