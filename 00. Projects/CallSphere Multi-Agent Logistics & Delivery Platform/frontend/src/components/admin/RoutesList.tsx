import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib';

export default function RoutesList() {
  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const response = await api.get('/routes');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading routes...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Routes & Stops</h2>
      {routes?.map((route: any) => (
        <div key={route.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{route.routeCode}</h3>
              <p className="text-sm text-gray-500">
                {route.driver?.user?.name} • {route.region} • {new Date(route.date).toLocaleDateString()}
              </p>
            </div>
            {route.vehicle && (
              <span className="text-sm text-gray-600">Vehicle: {route.vehicle.vehicleCode}</span>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Stops:</h4>
            {route.stops?.map((stop: any, index: number) => (
              <div key={stop.id} className="flex items-center space-x-2 text-sm">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium">
                  {stop.sequenceNumber}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{stop.shipment?.trackingNumber}</p>
                  <p className="text-gray-500 text-xs">{stop.shipment?.toAddress}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  stop.status === 'completed' ? 'bg-green-100 text-green-800' :
                  stop.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {stop.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

