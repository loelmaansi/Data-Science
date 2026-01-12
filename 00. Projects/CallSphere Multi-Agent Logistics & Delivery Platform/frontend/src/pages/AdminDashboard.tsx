import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authService, api, wsService } from '../lib';
import MetricsOverview from '../components/admin/MetricsOverview';
import ShipmentsTable from '../components/admin/ShipmentsTable';
import RoutesList from '../components/admin/RoutesList';
import IssuesQueue from '../components/admin/IssuesQueue';
import EscalationsPanel from '../components/admin/EscalationsPanel';
import MetricsAdmin from '../components/admin/MetricsAdmin';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'shipments' | 'routes' | 'issues' | 'escalations' | 'metrics';

export default function AdminDashboard() {
  const user = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const isAdmin = user?.role === 'admin';

  // Subscribe to real-time updates
  useQuery({
    queryKey: ['websocket-setup'],
    queryFn: async () => {
      const token = authService.getToken();
      if (token) {
        wsService.connect(token);
        wsService.subscribeIssues(() => {
          toast.success('New issue update received');
        });
        wsService.subscribeEscalations(() => {
          toast.success('Escalation update received');
        });
        wsService.subscribeMetrics(() => {
          toast.success('Metrics updated');
        });
      }
      return null;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">CallSphere Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.name} ({user?.role})</span>
              {user?.role === 'customer' && (
                <Link
                  to="/customer"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Customer Dashboard
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
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {(['overview', 'shipments', 'routes', 'issues', 'escalations'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'shipments' ? 'Shipments' : tab === 'routes' ? 'Routes' : tab === 'issues' ? 'Issues' : 'Escalations'}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('metrics')}
                className={`${
                  activeTab === 'metrics'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                Metrics Admin
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <MetricsOverview />}
          {activeTab === 'shipments' && <ShipmentsTable />}
          {activeTab === 'routes' && <RoutesList />}
          {activeTab === 'issues' && <IssuesQueue />}
          {activeTab === 'escalations' && <EscalationsPanel />}
          {activeTab === 'metrics' && isAdmin && <MetricsAdmin />}
        </div>
      </div>
    </div>
  );
}

