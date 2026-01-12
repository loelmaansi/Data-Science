import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function MetricsAdmin() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: definitions, refetch } = useQuery({
    queryKey: ['metric-definitions'],
    queryFn: async () => {
      const response = await api.get('/metrics/definitions');
      return response.data;
    },
  });

  const handleUpdate = async (id: string, data: any) => {
    try {
      await api.patch(`/metrics/definitions/${id}`, data);
      toast.success('Metric definition updated');
      setEditingId(null);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Metrics Administration</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Metric Definitions</h3>
        </div>
        <div className="divide-y">
          {definitions?.map((metric: any) => (
            <div key={metric.id} className="p-6">
              {editingId === metric.id ? (
                <MetricEditForm
                  metric={metric}
                  onSave={(data) => handleUpdate(metric.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{metric.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
                    <div className="mt-2 flex space-x-4 text-xs text-gray-500">
                      <span>Target: {metric.targetValue}</span>
                      <span>Warning: {metric.warningThreshold || 'N/A'}</span>
                      <span>Critical: {metric.criticalThreshold || 'N/A'}</span>
                      <span>Visible: {metric.isVisibleOnDashboard ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingId(metric.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricEditForm({ metric, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    targetValue: metric.targetValue,
    warningThreshold: metric.warningThreshold,
    criticalThreshold: metric.criticalThreshold,
    isVisibleOnDashboard: metric.isVisibleOnDashboard,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Target Value</label>
          <input
            type="number"
            value={formData.targetValue}
            onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Warning Threshold</label>
          <input
            type="number"
            value={formData.warningThreshold || ''}
            onChange={(e) => setFormData({ ...formData, warningThreshold: parseFloat(e.target.value) || null })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Critical Threshold</label>
          <input
            type="number"
            value={formData.criticalThreshold || ''}
            onChange={(e) => setFormData({ ...formData, criticalThreshold: parseFloat(e.target.value) || null })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Visible on Dashboard</label>
          <select
            value={formData.isVisibleOnDashboard ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isVisibleOnDashboard: e.target.value === 'true' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onSave(formData)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

