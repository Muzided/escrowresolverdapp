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
import { getResolverGraphData } from "@/services/Api/resolver/resolver"
import { ResolvedByMonthArray } from "@/types/resolver"
import { useAppKitAccount } from "@reown/appkit/react"
import { disputeResolutionHistory } from "../../../../../public/Data/Ecsrows"
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


export const ResolutionHistoryChart = () => {
    const { address } = useAppKitAccount();
    const { data: disputeResolutionHistory, isLoading, error } = useQuery<ResolvedByMonthArray>({
        queryKey: ['graph-stats'],
        queryFn: async () => {
          const response = await getResolverGraphData();
          return response.data;
        },
        enabled: !!address,
      });

    const chartData = {
        labels: disputeResolutionHistory?.map(item => item.month),
        datasets: [
          {
            label: 'Disputes Resolved',
            data: disputeResolutionHistory?.map(item => item.resolved),
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
        <div className="bg-zinc-50 shadow-sm dark:bg-zinc-900 p-6 rounded-lg ">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
          Dispute Resolution History
        </h2>
        {isLoading ? (
          <div className="w-full h-[400px] flex items-center justify-center">
            <div className="animate-pulse w-full h-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          </div>
        ) : (
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
        )}
      </div>
    );
  };