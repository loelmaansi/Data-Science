import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib';
import toast from 'react-hot-toast';

export default function EscalationsPanel() {
  const { data: issues, refetch } = useQuery({
    queryKey: ['issues-escalations'],
    queryFn: async () => {
      const response = await api.get('/delivery-issues?severity=high');
      return response.data;
    },
  });

  const handleTriggerEscalation = async (shipmentId: string, issueId?: string) => {
    try {
      await api.post('/escalations/trigger', {
        shipmentId,
        deliveryIssueId: issueId,
        reason: 'High severity issue requires escalation',
      });
      toast.success('Escalation triggered');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to trigger escalation');
    }
  };

  const handleAcknowledge = async (shipmentId: string) => {
    try {
      await api.post(`/escalations/${shipmentId}/acknowledge`, {
        method: 'dashboard',
        notes: 'Acknowledged via dashboard',
      });
      toast.success('Escalation acknowledged');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to acknowledge');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Escalations</h2>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">High Priority Issues</h3>
        </div>
        <div className="divide-y">
          {issues?.filter((issue: any) => issue.aiSeverityScore >= 0.7).map((issue: any) => (
            <div key={issue.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{issue.shipment?.trackingNumber}</p>
                  <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Severity: {(issue.aiSeverityScore * 100).toFixed(0)}% • {issue.issueType}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTriggerEscalation(issue.shipmentId, issue.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Escalate
                  </button>
                  <button
                    onClick={() => handleAcknowledge(issue.shipmentId)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(!issues || issues.filter((i: any) => i.aiSeverityScore >= 0.7).length === 0) && (
            <div className="p-6 text-center text-gray-500">
              No high-priority issues requiring escalation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

