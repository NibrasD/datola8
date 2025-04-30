import { useState, useEffect } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';

// AGC Token address on Base
const AGC_TOKEN_ADDRESS = '0x47E316d1951568B4FbC7A1BCD641C5624a756A05';

// Validation contract address on Base
const VALIDATION_CONTRACT_ADDRESS = '0x9f877df695aa8eff30b88a41a1fd5d247304bed2';

const AGC_TOKEN_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const VALIDATION_CONTRACT_ABI = [
  {
    inputs: [{ name: '_amount', type: 'uint256' }],
    name: 'stakeForValidation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unstakeValidation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_sessionId', type: 'uint256' },
      { name: '_score', type: 'uint256' }
    ],
    name: 'submitValidation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_validator', type: 'address' }],
    name: 'getValidatorDetails',
    outputs: [
      { name: 'stakedAmount', type: 'uint256' },
      { name: 'reputation', type: 'uint256' },
      { name: 'validationsCompleted', type: 'uint256' },
      { name: 'active', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSessionCounter',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_sessionId', type: 'uint256' }],
    name: 'validationSessions',
    outputs: [
      { name: 'datasetId', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'completed', type: 'bool' },
      { name: 'validationCount', type: 'uint256' },
      { name: 'finalScore', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_datasetId', type: 'uint256' }],
    name: 'createValidationSession',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  }
];

export interface ValidationSession {
  id: number;
  datasetId: number;
  startTime: number;
  endTime: number;
  completed: boolean;
  validationCount: number;
  finalScore: number;
}

export const useValidation = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ValidationSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Get validator details
  const { data: validatorDetails } = useReadContract({
    address: VALIDATION_CONTRACT_ADDRESS as `0x${string}`,
    abi: VALIDATION_CONTRACT_ABI,
    functionName: 'getValidatorDetails',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
      retry: 3,
      retryDelay: 1000,
    },
  });

  // Get session counter
  const { data: sessionCounter } = useReadContract({
    address: VALIDATION_CONTRACT_ADDRESS as `0x${string}`,
    abi: VALIDATION_CONTRACT_ABI,
    functionName: 'getSessionCounter',
    query: {
      enabled: true,
      retry: 3,
      retryDelay: 1000,
    },
  });

  // Fetch validation sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (!publicClient || !validatorDetails?.[3] || !sessionCounter) return;
      
      try {
        setIsLoadingSessions(true);
        console.log('Total sessions:', sessionCounter.toString());
        
        if (sessionCounter === 0n) {
          setSessions([]);
          setIsLoadingSessions(false);
          return;
        }

        // Fetch all sessions in parallel
        const promises = Array.from({ length: Number(sessionCounter) }, (_, i) => i + 1).map(async (id) => {
          try {
            const session = await publicClient.readContract({
              address: VALIDATION_CONTRACT_ADDRESS as `0x${string}`,
              abi: VALIDATION_CONTRACT_ABI,
              functionName: 'validationSessions',
              args: [BigInt(id)],
            }) as any[];

            if (session) {
              const [datasetId, startTime, endTime, completed, validationCount, finalScore] = session;
              
              return {
                id,
                datasetId: Number(datasetId),
                startTime: Number(startTime) * 1000,
                endTime: Number(endTime) * 1000,
                completed: completed,
                validationCount: Number(validationCount),
                finalScore: Number(finalScore)
              };
            }
          } catch (err) {
            console.error(`Error fetching session ${id}:`, err);
            return null;
          }
        });

        const results = await Promise.all(promises);
        const validSessions = results.filter((session): session is ValidationSession => session !== null);
        
        console.log('Fetched sessions:', validSessions);
        setSessions(validSessions);
      } catch (err) {
        console.error('Error fetching validation sessions:', err);
        setError('Failed to fetch validation sessions');
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [publicClient, validatorDetails, sessionCounter]);

  const stakeTokens = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Approving AGC tokens for staking:', amount);
      const parsedAmount = parseUnits(amount, 18);
      
      // First approve AGC tokens
      const { hash: approveHash } = await writeContractAsync({
        address: AGC_TOKEN_ADDRESS as `0x${string}`,
        abi: AGC_TOKEN_ABI,
        functionName: 'approve',
        args: [VALIDATION_CONTRACT_ADDRESS as `0x${string}`, parsedAmount],
      });

      console.log('Waiting for approval confirmation...');
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      // Then stake tokens
      console.log('Staking tokens...');
      const { hash: stakeHash } = await writeContractAsync({
        address: VALIDATION_CONTRACT_ADDRESS as `0x${string}`,
        abi: VALIDATION_CONTRACT_ABI,
        functionName: 'stakeForValidation',
        args: [parsedAmount],
      });

      console.log('Waiting for stake confirmation...');
      await publicClient.waitForTransactionReceipt({ hash: stakeHash });
      
      return stakeHash;
    } catch (err: any) {
      console.error('Error staking tokens:', err);
      setError(err.message || 'Failed to stake tokens');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const submitValidation = async (sessionId: number, score: number) => {
    if (!address) throw new Error('Wallet not connected');
    if (score < 0 || score > 100) throw new Error('Score must be between 0 and 100');
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Submitting validation:', { sessionId, score });
      
      const { hash } = await writeContractAsync({
        address: VALIDATION_CONTRACT_ADDRESS as `0x${string}`,
        abi: VALIDATION_CONTRACT_ABI,
        functionName: 'submitValidation',
        args: [BigInt(sessionId), BigInt(score)],
      });

      console.log('Waiting for validation confirmation...');
      await publicClient.waitForTransactionReceipt({ hash });
      
      return hash;
    } catch (err: any) {
      console.error('Error submitting validation:', err);
      setError(err.message || 'Failed to submit validation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createValidationSession = async (datasetId: number) => {
    if (!address) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Creating validation session for dataset:', datasetId);
      
      const { hash } = await writeContractAsync({
        address: VALIDATION_CONTRACT_ADDRESS as `0x${string}`,
        abi: VALIDATION_CONTRACT_ABI,
        functionName: 'createValidationSession',
        args: [BigInt(datasetId)],
      });

      console.log('Waiting for session creation confirmation...');
      await publicClient.waitForTransactionReceipt({ hash });
      
      return hash;
    } catch (err: any) {
      console.error('Error creating validation session:', err);
      setError(err.message || 'Failed to create validation session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    validatorDetails,
    sessions,
    isLoadingSessions,
    stakeTokens,
    submitValidation,
    createValidationSession,
    isLoading,
    error
  };
};