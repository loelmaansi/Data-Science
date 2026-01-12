import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { authService, api, wsService } from '../lib';
import ShipmentTracking from '../components/customer/ShipmentTracking';
import ChatVoiceWidget from '../components/customer/ChatVoiceWidget';
import ShipmentList from '../components/customer/ShipmentList';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const user = authService.getCurrentUser();
  const [selectedShipment, setSelectedShipment] = useState<any>(null);

  const { data: shipments, refetch } = useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      const response = await api.get('/shipments');
      return response.data;
    },
  });

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      wsService.connect(token);

      // Subscribe to shipment updates
      if (selectedShipment) {
        wsService.subscribeShipment(selectedShipment.trackingNumber, (data) => {
          toast.success('Shipment updated!');
          refetch();
        });
      }
    }

    return () => {
      if (selectedShipment) {
        wsService.unsubscribe('shipment.scan.created');
        wsService.unsubscribe('shipment.status.updated');
      }
    };
  }, [selectedShipment, refetch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">CallSphere</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name} ({user?.role})</span>
              {(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'dispatcher' || user?.role === 'driver') && (
                <Link
                  to="/admin"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => authService.logout()}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ShipmentTracking
              onShipmentSelect={setSelectedShipment}
              selectedShipment={selectedShipment}
            />
            {selectedShipment && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Shipment Details</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Status:</span> {selectedShipment.currentStatus}</p>
                  <p><span className="font-medium">ETA:</span> {new Date(selectedShipment.promisedDeliveryDate).toLocaleDateString()}</p>
                  {selectedShipment.lastScanLocation && (
                    <p><span className="font-medium">Last Location:</span> {selectedShipment.lastScanLocation}</p>
                  )}
                </div>
              </div>
            )}
            <ShipmentList
              shipments={shipments || []}
              onShipmentSelect={setSelectedShipment}
              selectedShipment={selectedShipment}
            />
          </div>

          <div className="lg:col-span-1">
            <ChatVoiceWidget shipmentId={selectedShipment?.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

