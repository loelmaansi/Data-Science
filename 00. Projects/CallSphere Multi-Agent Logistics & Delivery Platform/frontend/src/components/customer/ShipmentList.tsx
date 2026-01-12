interface ShipmentListProps {
  shipments: any[];
  onShipmentSelect: (shipment: any) => void;
  selectedShipment: any;
}

export default function ShipmentList({ shipments, onShipmentSelect, selectedShipment }: ShipmentListProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800',
      in_transit: 'bg-blue-100 text-blue-800',
      out_for_delivery: 'bg-yellow-100 text-yellow-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      returned: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">My Shipments</h2>
      </div>
      <div className="divide-y">
        {shipments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No shipments found
          </div>
        ) : (
          shipments.map((shipment) => (
            <div
              key={shipment.id}
              onClick={() => onShipmentSelect(shipment)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                selectedShipment?.id === shipment.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{shipment.trackingNumber}</p>
                  <p className="text-sm text-gray-500">{shipment.toAddress}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    ETA: {new Date(shipment.promisedDeliveryDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.currentStatus)}`}>
                  {shipment.currentStatus.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

