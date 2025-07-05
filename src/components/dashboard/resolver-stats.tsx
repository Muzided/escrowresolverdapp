import { StatsCard } from "@/components/dashboard/stats-card"
import { useWeb3 } from "@/context/Web3Context"
import { useFactory } from "@/Hooks/useFactory"
import { useEffect, useState } from "react"
import { disputeStats, adoptedDisputes, disputeResolutionHistory } from "../../../public/Data/Ecsrows"
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
  const [totalEscrows, setTotalEscrows] = useState<number>(0)
  const [totalPayments, setTotalPayments] = useState<string>("0")
  const {address}=  useAppKitAccount();
  const { data: profileStats, isLoading, error } = useQuery<resolverStats>({
    queryKey: ['profile-stats'],
    queryFn: async () => {
      const response = await getResolverStats();
      return response.data;
    },
    enabled: !!address,
  });
 console.log("profile-stats",profileStats)

  // Chart configuration
  const chartData = {
    labels: disputeResolutionHistory.map(item => item.month),
    datasets: [
      {
        label: 'Disputes Resolved',
        data: disputeResolutionHistory.map(item => item.resolved),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Dispute Resolution History'
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards Section */}
      <div className="grid gap-6 md:grid-cols-2">
        
        <StatsCard 
          title="Total Disputes Resolved" 
          description="Successfully resolved disputes" 
          value={profileStats?.stats.resolved.toString()} 
        />
        <StatsCard 
          title=" Adopted Disputes" 
          description={`${profileStats?.stats.ongoing}/${disputeStats.maxDailyLimit} adopted `} 
          value={`${profileStats?.stats.ongoing}/${2}`} 
        />
      </div>

      {/* Dispute Resolution Graph */}
      <div className="bg-zinc-50 shadow-sm dark:bg-zinc-900 p-6 rounded-lg ">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
          Dispute Resolution History
        </h2>
        <div className="w-full h-[400px] relative">
          <Line 
            data={chartData} 
            options={{
              ...chartOptions,
              maintainAspectRatio: false,
              responsive: true
            }} 
          />
        </div>
      </div>

      {/* Active Disputes Section */}
      {/* <div className="bg-zinc-50 shadow-sm dark:bg-zinc-900 p-6 rounded-lg ">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
          Active Adopted Disputes
        </h2>
        <div className="space-y-4">
          {adoptedDisputes.map((dispute) => (
            <div 
              key={dispute.id}
              className="border border-zinc-200 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 bg-zinc-100 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    {dispute.escrowId}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {dispute.description}
                  </p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white mt-2">
                    Amount: {dispute.amount}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Adopted: {new Date(dispute.adoptedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Deadline: {new Date(dispute.deadline).toLocaleDateString()}
                  </p>
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-2">
                    {dispute.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}

    </div>
  )
}

