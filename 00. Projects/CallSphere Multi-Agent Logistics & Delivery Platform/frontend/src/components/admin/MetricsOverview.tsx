import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib';

export default function MetricsOverview() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics-overview'],
    queryFn: async () => {
      const response = await api.get('/metrics/overview');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading metrics...</div>;
  }

  const metricCards = [
    {
      title: 'Total Shipments',
      value: metrics?.totalShipments || 0,
      color: 'bg-blue-500',
    },
    {
      title: 'Delivered',
      value: metrics?.deliveredShipments || 0,
      color: 'bg-green-500',
    },
    {
      title: 'On-Time Delivery Rate',
      value: `${(metrics?.onTimeDeliveryRate || 0).toFixed(1)}%`,
      color: 'bg-indigo-500',
    },
    {
      title: 'First Attempt Success',
      value: `${(metrics?.firstAttemptSuccessRate || 0).toFixed(1)}%`,
      color: 'bg-purple-500',
    },
    {
      title: 'Open Issues',
      value: metrics?.openIssues || 0,
      color: 'bg-orange-500',
    },
    {
      title: 'SLA Risk Count',
      value: metrics?.slaRiskCount || 0,
      color: 'bg-red-500',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Metrics Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                <span className="text-white text-xl">📊</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

