import { useState } from 'react';
import { api } from '../../lib';
import toast from 'react-hot-toast';

interface ShipmentTrackingProps {
  onShipmentSelect: (shipment: any) => void;
  selectedShipment: any;
}

export default function ShipmentTracking({ onShipmentSelect, selectedShipment }: ShipmentTrackingProps) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/shipments/track/${trackingNumber}`);
      onShipmentSelect(response.data);
      toast.success('Shipment found!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Shipment not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Track Your Shipment</h2>
      <form onSubmit={handleTrack} className="flex space-x-2">
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Enter tracking number (e.g., CS000001)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Tracking...' : 'Track'}
        </button>
      </form>
    </div>
  );
}

