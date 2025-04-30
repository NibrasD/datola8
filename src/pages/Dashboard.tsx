import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  BarChart, 
  Clock, 
  DollarSign, 
  ShoppingCart, 
  ChevronRight,
  Shield,
  Users,
  FileText,
  Star,
  Download,
  ArrowRight,
  Brain,
  Tag,
  LayoutGrid,
  List,
  Loader,
  ExternalLink
} from 'lucide-react';
import useWeb3 from '../hooks/useWeb3';
import { useValidation } from '../hooks/useValidation';
import { useAccount } from 'wagmi';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('owned');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { address, isConnected } = useAccount();
  const { datasets, metadata, totalMinted } = useWeb3();
  const { validatorDetails, sessions } = useValidation();

  // Filter datasets owned by the connected address
  const ownedDatasets = React.useMemo(() => {
    if (!datasets || !metadata?.[0] || !address) return [];
    
    return datasets.filter((dataset, index) => {
      const owner = metadata[0][index];
      return typeof owner === 'string' && owner.toLowerCase() === address.toLowerCase();
    });
  }, [datasets, metadata, address]);

  // Filter datasets purchased by the connected address
  const purchasedDatasets = React.useMemo(() => {
    if (!datasets || !metadata?.[0] || !address) return [];
    
    return datasets.filter((dataset, index) => {
      const owner = metadata[0][index];
      return typeof owner === 'string' && owner.toLowerCase() !== address.toLowerCase();
    });
  }, [datasets, metadata, address]);

  // Calculate total revenue from validations
  const totalRevenue = validatorDetails ? Number(validatorDetails[0]) / 10**18 : 0;

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Database className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Connect Wallet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please connect your wallet to view your dashboard.
        </p>
      </div>
    );
  }

  if (!datasets || !metadata || totalMinted === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 text-purple-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Total Datasets: {Number(totalMinted)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)} AGC</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Datasets Owned</p>
              <p className="text-2xl font-bold text-gray-900">{ownedDatasets.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Datasets Purchased</p>
              <p className="text-2xl font-bold text-gray-900">{purchasedDatasets.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Validations</p>
              <p className="text-2xl font-bold text-gray-900">
                {validatorDetails ? Number(validatorDetails[2]) : 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Tabs */}
      <div>
        <div className="flex justify-between items-center border-b border-gray-200 mb-6">
          <div className="flex">
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'owned' 
                  ? 'border-purple-500 text-purple-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('owned')}
            >
              My Datasets ({ownedDatasets.length})
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'purchased' 
                  ? 'border-purple-500 text-purple-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('purchased')}
            >
              Purchased Datasets ({purchasedDatasets.length})
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-700' : 'text-gray-400'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Owned Datasets */}
        {activeTab === 'owned' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Datasets</h2>
              <Link 
                to="/create" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
              >
                Create Dataset
              </Link>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedDatasets.map((dataset, index) => (
                  <Link 
                    key={index}
                    to={`/dataset/${metadata[0][index]}`} 
                    className="group bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="h-40 bg-gradient-to-r from-purple-400 to-indigo-500 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="h-20 w-20 text-white opacity-20" />
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {dataset.name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {dataset.description}
                      </p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Size: {Number(dataset.size).toLocaleString()} bytes
                        </span>
                        <a 
                          href={dataset.dataUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700"
                        >
                          View Data
                        </a>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dataset
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ownedDatasets.map((dataset, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded bg-purple-100 flex items-center justify-center">
                                <Brain className="h-6 w-6 text-purple-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{dataset.name}</div>
                                <div className="text-sm text-gray-500">{dataset.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {Number(dataset.size).toLocaleString()} bytes
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/dataset/${metadata[0][index]}`} className="text-purple-600 hover:text-purple-900">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {ownedDatasets.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No datasets yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create your first dataset to start earning.
                </p>
                <div className="mt-6">
                  <Link
                    to="/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Create Dataset
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Purchased Datasets */}
        {activeTab === 'purchased' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchased Datasets</h2>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedDatasets.map((dataset, index) => (
                  <Link 
                    key={index}
                    to={`/dataset/${metadata[0][index]}`} 
                    className="group bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="h-40 bg-gradient-to-r from-blue-400 to-indigo-500 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="h-20 w-20 text-white opacity-20" />
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {dataset.name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {dataset.description}
                      </p>
                      <div className="mt-4">
                        <a
                          href={dataset.dataUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Access Dataset
                        </a>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dataset
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Owner
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchasedDatasets.map((dataset, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded bg-blue-100 flex items-center justify-center">
                                <Brain className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{dataset.name}</div>
                                <div className="text-sm text-gray-500">{dataset.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {Number(dataset.size).toLocaleString()} bytes
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metadata[0][index].substring(0, 6)}...{metadata[0][index].substring(metadata[0][index].length - 4)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a
                              href={dataset.dataUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Access
                            </a>
                            <Link to={`/dataset/${metadata[0][index]}`} className="text-purple-600 hover:text-purple-900">
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {purchasedDatasets.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No purchased datasets</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Browse the marketplace to find and purchase datasets.
                </p>
                <div className="mt-6">
                  <Link
                    to="/marketplace"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Activity */}
      {validatorDetails && validatorDetails[3] && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Validation Activity</h2>
            <Link to="/validation" className="text-purple-600 hover:text-purple-700 font-medium flex items-center text-sm">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dataset
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Session #{session.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Dataset #{session.datasetId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          session.completed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {session.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.completed ? `${session.finalScore}/100` : `${session.validationCount}/3 validations`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;