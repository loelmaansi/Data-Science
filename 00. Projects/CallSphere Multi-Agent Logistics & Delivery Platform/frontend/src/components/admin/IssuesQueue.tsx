import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib';

export default function IssuesQueue() {
  const { data: issues, isLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const response = await api.get('/delivery-issues');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading issues...</div>;
  }

  const getSeverityColor = (score: number) => {
    if (score >= 0.7) return 'bg-red-100 text-red-800';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Issues Queue</h2>
      </div>
      <div className="divide-y">
        {issues?.map((issue: any) => (
          <div key={issue.id} className="p-6 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.aiSeverityScore)}`}>
                    Severity: {(issue.aiSeverityScore * 100).toFixed(0)}%
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {issue.issueType}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-900">{issue.description}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Shipment: {issue.shipment?.trackingNumber} • Reported by: {issue.reportedBy?.name}
                </p>
                {issue.resolutionNotes && (
                  <p className="mt-2 text-sm text-gray-600 italic">Resolution: {issue.resolutionNotes}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

