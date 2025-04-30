import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  Star, 
  Database, 
  Award, 
  Clock, 
  ExternalLink,
  Edit,
  Brain,
  Tag,
  Shield,
  Loader,
  AlertCircle
} from 'lucide-react';
import { useAccount } from 'wagmi';
import useWeb3 from '../hooks/useWeb3';
import { useValidation } from '../hooks/useValidation';

const Profile: React.FC = () => {
  const { address: profileAddress } = useParams<{ address: string }>();
  const { address: connectedAddress } = useAccount();
  const { datasets, metadata, totalMinted } = useWeb3();
  const { validatorDetails } = useValidation();
  const [activeTab, setActiveTab] = useState('datasets');
  
  const isOwnProfile = profileAddress?.toLowerCase() === connectedAddress?.toLowerCase();

  // Filter datasets owned by this profile
  const userDatasets = datasets?.filter((dataset, index) => {
    const owner = metadata?.[0]?.[index];
    return typeof owner === 'string' && owner.length > 0 && owner.toLowerCase() === profileAddress?.toLowerCase();
  }) || [];

  if (!datasets || !metadata) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 text-purple-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading profile data...</span>
      </div>
    );
  }

  if (!profileAddress) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Invalid Profile</h3>
        <p className="mt-1 text-sm text-gray-500">
          No wallet address provided.
        </p>
      </div>
    );
  }

  // Calculate validation stats if this is a validator
  const validationStats = validatorDetails && profileAddress?.toLowerCase() === connectedAddress?.toLowerCase() ? {
    stakedAmount: Number(validatorDetails[0]) / 10**18,
    reputation: Number(validatorDetails[1]),
    validationsCompleted: Number(validatorDetails[2]),
    isActive: validatorDetails[3]
  } : null;

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 sm:h-48"></div>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="-mt-12 sm:-mt-16 flex items-end">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-purple-100 border-4 border-white flex items-center justify-center">
                <User className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600" />
              </div>
            </div>
            <div className="ml-4 sm:ml-6 flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {`${profileAddress.substring(0, 6)}...${profileAddress.substring(profileAddress.length - 4)}`}
                  </h1>
                  <a
                    href={`https://basescan.org/address/${profileAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-gray-400 hover:text-gray-500"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
                {validationStats?.isActive && (
                  <div className="flex items-center mt-1">
                    <Shield className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Active Validator</span>
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <div className="mt-4 sm:mt-0">
                  <Link
                    to="/create"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Create Dataset
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:space-x-8">
              <div className="flex-1 mb-6 sm:mb-0">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Stats</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-2xl font-semibold text-purple-600">{userDatasets.length}</p>
                    <p className="text-sm text-gray-500">Datasets</p>
                  </div>
                  {validationStats && (
                    <>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-2xl font-semibold text-blue-600">{validationStats.validationsCompleted}</p>
                        <p className="text-sm text-gray-500">Validations</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-2xl font-semibold text-green-600">{validationStats.reputation}</p>
                        <p className="text-sm text-gray-500">Reputation</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-2xl font-semibold text-orange-600">{validationStats.stakedAmount.toFixed(2)} AGC</p>
                        <p className="text-sm text-gray-500">Staked</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'datasets' 
                ? 'border-purple-500 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('datasets')}
          >
            Datasets
          </button>
          {validationStats?.isActive && (
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'validations' 
                  ? 'border-purple-500 text-purple-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('validations')}
            >
              Validation Activity
            </button>
          )}
        </div>
      </div>

      {/* Datasets Tab */}
      {activeTab === 'datasets' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Datasets</h2>
            {isOwnProfile && (
              <Link 
                to="/create" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
              >
                Create Dataset
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userDatasets.map((dataset, index) => (
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

          {userDatasets.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
              <Database className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No datasets yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                {isOwnProfile 
                  ? "You haven't created any datasets yet."
                  : "This user hasn't created any datasets yet."}
              </p>
              {isOwnProfile && (
                <div className="mt-6">
                  <Link
                    to="/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Create Your First Dataset
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Validations Tab */}
      {activeTab === 'validations' && validationStats?.isActive && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Validation Activity</h2>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Validator Stats</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Current validation metrics and reputation
                  </p>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-green-600">Active Validator</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Reputation Score</p>
                      <p className="text-2xl font-semibold text-gray-900">{validationStats.reputation}/100</p>
                    </div>
                    <Award className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${validationStats.reputation}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Validations</p>
                      <p className="text-2xl font-semibold text-gray-900">{validationStats.validationsCompleted}</p>
                    </div>
                    <Shield className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Staked Amount</p>
                      <p className="text-2xl font-semibold text-gray-900">{validationStats.stakedAmount.toFixed(2)} AGC</p>
                    </div>
                    <Database className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/validation"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                >
                  View Validation Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;