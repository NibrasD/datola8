import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Brain,
  ExternalLink,
  BarChart3,
  Info,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { parseUnits } from 'viem';
import useWeb3 from '../hooks/useWeb3';

const FIXED_PRICE = '0.01';
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 3 seconds

const DatasetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { datasets, metadata, isConnected, address, approveAGC, purchaseDataset, publicClient } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Check if current user owns this dataset
  const isOwner = React.useMemo(() => {
    if (!address || !metadata?.[0] || !id) return false;
    const datasetIndex = parseInt(id) - 1;
    const owner = metadata[0][datasetIndex];
    return typeof owner === 'string' && owner.toLowerCase() === address.toLowerCase();
  }, [address, metadata, id]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchDatasetWithRetry = () => {
      if (!datasets || !metadata || !id) return;

      const datasetId = parseInt(id);
      const datasetIndex = datasetId - 1;

      console.log('Attempting to fetch dataset:', {
        datasetId,
        datasetIndex,
        datasetsLength: datasets.length,
        metadataExists: !!metadata[0] && !!metadata[1]
      });

      if (
        datasetIndex < 0 || 
        datasetIndex >= datasets.length ||
        !datasets[datasetIndex] ||
        !metadata[0] ||
        !metadata[1] ||
        datasetIndex >= metadata[0].length
      ) {
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying dataset fetch (${retryCount + 1}/${MAX_RETRIES})...`);
          setIsRetrying(true);
          setRetryCount(prev => prev + 1);
          timeoutId = setTimeout(fetchDatasetWithRetry, RETRY_DELAY);
        } else {
          console.log('Max retries reached, dataset not found');
          setIsRetrying(false);
          setError('Dataset not found after multiple attempts. Please try again later.');
        }
        return;
      }

      console.log('Dataset found:', datasets[datasetIndex]);
      setIsRetrying(false);
    };

    fetchDatasetWithRetry();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [datasets, metadata, id, retryCount]);

  // Loading state with retry indication
  if (!datasets || !metadata) {
    return (
      <div className="text-center py-12">
        <Loader className="h-8 w-8 text-purple-600 animate-spin mx-auto" />
        <p className="mt-2 text-gray-600">
          {isRetrying 
            ? `Retrying dataset fetch (Attempt ${retryCount}/${MAX_RETRIES})...`
            : 'Loading dataset details...'}
        </p>
      </div>
    );
  }

  // Validate dataset ID
  if (!id || isNaN(parseInt(id))) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
        <p className="mt-2 text-red-600">Invalid dataset ID format</p>
      </div>
    );
  }

  const datasetId = parseInt(id);
  const datasetIndex = datasetId - 1;

  // Validate dataset exists
  if (
    datasetIndex < 0 || 
    datasetIndex >= datasets.length ||
    !datasets[datasetIndex] ||
    !metadata[0] ||
    !metadata[1] ||
    datasetIndex >= metadata[0].length
  ) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
        <p className="mt-2 text-red-600">
          {isRetrying 
            ? `Attempting to fetch dataset (Retry ${retryCount}/${MAX_RETRIES})...`
            : 'Dataset not found'}
        </p>
        {isRetrying && (
          <div className="mt-4">
            <Loader className="h-6 w-6 text-purple-600 animate-spin mx-auto" />
          </div>
        )}
      </div>
    );
  }

  // Format size to 10 digits
  const formatSize = (size: number): string => {
    const sizeStr = size.toString();
    if (sizeStr.length <= 10) return sizeStr;
    return sizeStr.slice(0, 10);
  };

  // Create dataset object from valid data
  const dataset = {
    id: datasetId,
    name: datasets[datasetIndex].name,
    description: datasets[datasetIndex].description,
    size: formatSize(Number(datasets[datasetIndex].size)),
    dataUrl: datasets[datasetIndex].dataUrl,
    tokenURI: metadata[1][datasetIndex]
  };

  console.log('Dataset details:', dataset);

  const handlePurchase = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!FIXED_PRICE || isNaN(Number(FIXED_PRICE))) {
      setError('Invalid price configuration');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Approve tokens
      console.log('Approving tokens...');
      const { hash: approveHash } = await approveAGC(FIXED_PRICE);
      await publicClient.waitForTransactionReceipt({ hash: approveHash });
      console.log('Token approval confirmed:', approveHash);
      
      // Purchase dataset
      console.log('Purchasing dataset...');
      const { hash: purchaseHash } = await purchaseDataset(datasetId);
      await publicClient.waitForTransactionReceipt({ hash: purchaseHash });
      console.log('Purchase confirmed:', purchaseHash);
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Error purchasing dataset:', err);
      setError(err.message || 'Failed to purchase dataset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dataset header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                Dataset #{dataset.id}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{dataset.name}</h1>
            <p className="text-gray-600">{dataset.description}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {isOwner || success ? (
              <a
                href={dataset.dataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Access Dataset
              </a>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={!isConnected || isLoading}
                className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                  ${isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Purchase Dataset ({FIXED_PRICE} AGC)
                  </>
                )}
              </button>
            )}
            <a
              href={dataset.tokenURI}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Metadata
            </a>
          </div>
        </div>

        {/* Status messages */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-md p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="ml-3 text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border border-green-100 rounded-md p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="ml-3 text-green-700">
              Purchase successful! You can now access the dataset.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dataset Specifications */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Specifications</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Size</span>
              <span className="font-medium text-gray-900">{dataset.size} bytes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Token ID</span>
              <span className="font-medium text-gray-900">#{dataset.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price</span>
              <span className="font-medium text-purple-600">{FIXED_PRICE} AGC</span>
            </div>
          </div>
        </div>

        {/* Data Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Access</h3>
          <div className="space-y-4">
            {isOwner || success ? (
              <div>
                <p className="text-gray-600 mb-3">You have access to:</p>
                <a
                  href={dataset.dataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Access Dataset
                </a>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-3">Purchase this dataset to gain access to the data.</p>
                <button
                  onClick={handlePurchase}
                  disabled={!isConnected || isLoading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                    ${isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {isLoading ? 'Processing...' : `Purchase Dataset (${FIXED_PRICE} AGC)`}
                </button>
              </div>
            )}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-600 mb-3">View NFT metadata at:</p>
              <a
                href={dataset.tokenURI}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Metadata
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage Guidelines</h3>
            <p className="text-gray-700 mb-3">
              This dataset is provided as an NFT on the Base network. Please ensure you:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Properly attribute the dataset when used</li>
              <li>Review the data format and structure before use</li>
              <li>Check the dataset documentation for any specific usage requirements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetDetails;