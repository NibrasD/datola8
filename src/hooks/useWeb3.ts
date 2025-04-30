import { useAccount, useBalance, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { useCallback } from 'react';

// AGC Token address on Base
const AGC_TOKEN_ADDRESS = '0x47E316d1951568B4FbC7A1BCD641C5624a756A05';

// Dataset NFT contract address on Base
const DATASET_NFT_ADDRESS = '0x58Ca8C6FC43E9B13266cdAc29544Abd9bB0dC807';

const AGC_TOKEN_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
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

const DATASET_NFT_ABI = [
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'dataUrl', type: 'string' },
      { name: 'size', type: 'uint256' },
      { name: 'tokenURI_', type: 'string' }
    ],
    name: 'mintDatasetNFT',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalMinted',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getAllDatasets',
    outputs: [
      {
        components: [
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'dataUrl', type: 'string' },
          { name: 'size', type: 'uint256' }
        ],
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getAllDatasetMetadata',
    outputs: [
      { name: '', type: 'uint256[]' },
      { name: '', type: 'string[]' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_datasetId', type: 'uint256' }],
    name: 'purchaseDataset',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_datasetId', type: 'uint256' }],
    name: 'getPrice',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
];

const useWeb3 = () => {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Get AGC token balance
  const { data: agcBalance } = useReadContract({
    address: AGC_TOKEN_ADDRESS as `0x${string}`,
    abi: AGC_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
      staleTime: 0,
      cacheTime: 0,
      retry: true,
      retryDelay: 1000
    },
  });

  // Get total minted datasets
  const { data: totalMinted } = useReadContract({
    address: DATASET_NFT_ADDRESS as `0x${string}`,
    abi: DATASET_NFT_ABI,
    functionName: 'totalMinted',
    query: {
      enabled: true,
      staleTime: 0,
      cacheTime: 0,
      retry: true,
      retryDelay: 1000,
      onSuccess: (data) => {
        console.log('Total minted datasets:', data);
      },
      onError: (error) => {
        console.error('Error fetching total minted:', error);
      }
    },
  });

  // Get all datasets
  const { data: datasets, refetch: refetchDatasets } = useReadContract({
    address: DATASET_NFT_ADDRESS as `0x${string}`,
    abi: DATASET_NFT_ABI,
    functionName: 'getAllDatasets',
    query: {
      enabled: true,
      staleTime: 0,
      cacheTime: 0,
      retry: true,
      retryDelay: 1000,
      onSuccess: (data) => {
        console.log('Fetched datasets from contract:', data);
      },
      onError: (error) => {
        console.error('Error fetching datasets:', error);
      }
    },
  });

  // Get all dataset metadata
  const { data: metadata, refetch: refetchMetadata } = useReadContract({
    address: DATASET_NFT_ADDRESS as `0x${string}`,
    abi: DATASET_NFT_ABI,
    functionName: 'getAllDatasetMetadata',
    query: {
      enabled: true,
      staleTime: 0,
      cacheTime: 0,
      retry: true,
      retryDelay: 1000,
      onSuccess: (data) => {
        console.log('Fetched metadata from contract:', data);
      },
      onError: (error) => {
        console.error('Error fetching metadata:', error);
      }
    },
  });

  // Get owner of dataset
  const getDatasetOwner = useCallback(async (tokenId: number) => {
    if (!publicClient) return null;
    try {
      const owner = await publicClient.readContract({
        address: DATASET_NFT_ADDRESS as `0x${string}`,
        abi: DATASET_NFT_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      });
      return owner as string;
    } catch (error) {
      console.error('Error fetching dataset owner:', error);
      return null;
    }
  }, [publicClient]);

  // Approve AGC tokens for spending
  const approveAGC = useCallback(async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    if (!amount || isNaN(Number(amount))) throw new Error('Invalid amount');
    
    try {
      console.log('Approving AGC tokens:', amount);
      const parsedAmount = parseUnits(amount, 18);
      const tx = await writeContractAsync({
        address: AGC_TOKEN_ADDRESS as `0x${string}`,
        abi: AGC_TOKEN_ABI,
        functionName: 'approve',
        args: [DATASET_NFT_ADDRESS as `0x${string}`, parsedAmount],
      });
      console.log('AGC approval transaction:', tx);
      return tx;
    } catch (error) {
      console.error('Error approving tokens:', error);
      throw error;
    }
  }, [address, writeContractAsync]);

  // Purchase a dataset
  const purchaseDataset = useCallback(async (datasetId: number) => {
    if (!address) throw new Error('Wallet not connected');
    if (typeof datasetId !== 'number' || isNaN(datasetId) || datasetId <= 0) {
      throw new Error('Invalid dataset ID');
    }
    
    try {
      console.log('Purchasing dataset:', datasetId);
      const tx = await writeContractAsync({
        address: DATASET_NFT_ADDRESS as `0x${string}`,
        abi: DATASET_NFT_ABI,
        functionName: 'purchaseDataset',
        args: [BigInt(datasetId)],
      });
      console.log('Purchase transaction:', tx);
      
      // Refetch data after purchase
      await Promise.all([refetchDatasets(), refetchMetadata()]);
      
      return tx;
    } catch (error) {
      console.error('Error purchasing dataset:', error);
      throw error;
    }
  }, [address, writeContractAsync, refetchDatasets, refetchMetadata]);

  // Mint a new dataset NFT
  const mintDataset = useCallback(async (
    name: string,
    description: string,
    dataUrl: string,
    size: number,
    tokenURI: string
  ) => {
    if (!address) throw new Error('Wallet not connected');
    
    try {
      console.log('Minting dataset NFT:', {
        name,
        description,
        dataUrl,
        size,
        tokenURI
      });

      const tx = await writeContractAsync({
        address: DATASET_NFT_ADDRESS as `0x${string}`,
        abi: DATASET_NFT_ABI,
        functionName: 'mintDatasetNFT',
        args: [name, description, dataUrl, BigInt(size), tokenURI],
      });

      console.log('Dataset NFT minted:', tx);
      
      // Refetch data after minting
      await Promise.all([refetchDatasets(), refetchMetadata()]);
      
      return tx;
    } catch (error) {
      console.error('Error minting dataset:', error);
      throw error;
    }
  }, [address, writeContractAsync, refetchDatasets, refetchMetadata]);

  return {
    address,
    isConnected,
    agcBalance,
    totalMinted,
    datasets,
    metadata,
    mintDataset,
    approveAGC,
    purchaseDataset,
    getDatasetOwner,
    DATASET_NFT_ADDRESS,
    DATASET_NFT_ABI,
    publicClient
  };
};

export default useWeb3;