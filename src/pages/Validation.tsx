import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Brain,
  ArrowRight,
  Users,
  Award,
  Coins,
  Loader,
  Plus
} from 'lucide-react';
import { useValidation } from '../hooks/useValidation';

const Validation: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { validatorDetails, sessions, stakeTokens, submitValidation, createValidationSession, isLoading, error: validationError } = useValidation();
  const [stakeAmount, setStakeAmount] = useState('0.01');
  const [validationScore, setValidationScore] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [newDatasetId, setNewDatasetId] = useState<string>('');

  const isValidator = validatorDetails && validatorDetails[3]; // Check if validator is active
  const stakedAmount = validatorDetails ? Number(validatorDetails[0]) / 10**18 : 0;

  const handleStake = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      await stakeTokens(stakeAmount);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to stake tokens');
    }
  };

  const handleValidate = async (sessionId: number) => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isValidator) {
      setError('You must stake tokens to become a validator first');
      return;
    }

    if (validationScore < 0 || validationScore > 100) {
      setError('Validation score must be between 0 and 100');
      return;
    }

    try {
      await submitValidation(sessionId, validationScore);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to submit validation');
    }
  };

  const handleCreateSession = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!newDatasetId || isNaN(Number(newDatasetId))) {
      setError('Please enter a valid dataset ID');
      return;
    }

    try {
      await createValidationSession(Number(newDatasetId));
      setError(null);
      setNewDatasetId('');
    } catch (err: any) {
      setError(err.message || 'Failed to create validation session');
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Connect Wallet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please connect your wallet to access the validation dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dataset Validation</h1>
      </div>

      {/* Validator Stats */}
      {isValidator && validatorDetails && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Staked Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stakedAmount} AGC
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Coins className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Reputation Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Number(validatorDetails[1])}/100
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Validations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Number(validatorDetails[2])}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="text-2xl font-bold text-gray-900">Active</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staking Section */}
      {!isValidator && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Become a Validator</h2>
          <p className="text-gray-600 mb-6">
            Stake AGC tokens to participate in dataset validation and earn rewards. 
            Minimum stake required: 0.01 AGC
          </p>

          <div className="max-w-md">
            <div className="mb-4">
              <label htmlFor="stakeAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Stake Amount (AGC)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="stakeAmount"
                  id="stakeAmount"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            <button
              onClick={handleStake}
              disabled={!isConnected || isLoading || Number(stakeAmount) < 0.01}
              className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                ${isLoading || !isConnected || Number(stakeAmount) < 0.01
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
                }`}
            >
              {isLoading ? (
                <>
                  <Clock className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                'Stake Tokens'
              )}
            </button>

            {(error || validationError) && (
              <div className="mt-4 bg-red-50 border border-red-100 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error || validationError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Validation Session */}
      {isValidator && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Validation Session</h2>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Enter Dataset ID"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              value={newDatasetId}
              onChange={(e) => setNewDatasetId(e.target.value)}
            />
            <button
              onClick={handleCreateSession}
              disabled={isLoading || !newDatasetId}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                ${isLoading || !newDatasetId ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {isLoading ? (
                <Clock className="animate-spin h-4 w-4" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Validation Sessions */}
      {isValidator && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Validation Sessions</h2>
          
          {sessions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
              <Loader className="mx-auto h-8 w-8 text-purple-600 animate-spin" />
              <p className="mt-2 text-gray-600">Loading validation sessions...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dataset #{session.datasetId}
                        </h3>
                        <p className="text-sm text-gray-500">Session #{session.id}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${!session.completed 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {!session.completed ? 'Active' : 'Completed'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Validations</span>
                        <span className="text-gray-900">
                          {session.validationCount}/3
                        </span>
                      </div>

                      {!session.completed && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${(session.validationCount / 3) * 100}%` }}
                            ></div>
                          </div>

                          <div className="mt-4">
                            <label htmlFor={`score-${session.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Validation Score (0-100)
                            </label>
                            <input
                              type="number"
                              id={`score-${session.id}`}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                              value={validationScore}
                              onChange={(e) => setValidationScore(Number(e.target.value))}
                              min="0"
                              max="100"
                            />
                          </div>
                        </>
                      )}

                      {session.completed && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Final Score</span>
                          <span className="text-gray-900">{session.finalScore}/100</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Time Remaining</span>
                        <span className="text-gray-900">
                          {!session.completed
                            ? Math.floor((session.endTime - Date.now()) / (1000 * 60 * 60)) + ' hours'
                            : 'Completed'
                          }
                        </span>
                      </div>
                    </div>

                    {!session.completed && (
                      <button
                        onClick={() => handleValidate(session.id)}
                        disabled={isLoading || validationScore < 0 || validationScore > 100}
                        className={`mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white
                          ${isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                      >
                        {isLoading ? (
                          <>
                            <Clock className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Processing...
                          </>
                        ) : (
                          'Submit Validation'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Validation;