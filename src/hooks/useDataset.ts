import { useState } from 'react';
import axios from 'axios';
import useWeb3 from './useWeb3';

interface UploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  message?: string;
}

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1MWQ5OWRiYi05NmFmLTQwYzctYjQ3YS1jM2I2YmIzNDU0NjMiLCJlbWFpbCI6ImxvdGZ5Z2VteUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMzliNzQ5OTZmMWQ1OThiM2ExNTEiLCJzY29wZWRLZXlTZWNyZXQiOiJjMDRmYzA0NTkyOTJlZjlkZDJlZThlZTM3ZDRiYTJlMzM5ZjNhMzI3NmVhYmQ5NmRmOWUyMWVjNGQ3ZWNmYWRiIiwiZXhwIjoxNzc3NTQyMzU2fQ.ndqyRDrdP3UUycydmcNMT_5UMiM2GxMGsMP645VpUfc';

export const useDataset = () => {
  const { mintDataset } = useWeb3();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: 'idle',
    progress: 0
  });

  const uploadDataset = async (file: File): Promise<string> => {
    try {
      console.log('Starting dataset upload to IPFS...', { fileName: file.name, fileSize: file.size });
      setUploadProgress({ status: 'uploading', progress: 0 });

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${PINATA_JWT}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log('Upload progress:', percentCompleted + '%');
              setUploadProgress({
                status: 'uploading',
                progress: percentCompleted,
                message: `Uploading dataset... ${percentCompleted}%`
              });
            }
          }
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `ipfs://${ipfsHash}`;
      console.log('Dataset uploaded successfully to IPFS:', ipfsUrl);

      setUploadProgress({
        status: 'success',
        progress: 100,
        message: 'Dataset uploaded successfully!'
      });

      return ipfsUrl;
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Error uploading dataset'
      });
      throw error;
    }
  };

  const mintDatasetNFT = async (
    name: string,
    description: string,
    dataUrl: string,
    size: number,
    tokenURI: string
  ) => {
    try {
      console.log('Minting dataset NFT with metadata:', {
        name,
        description,
        dataUrl,
        size,
        tokenURI
      });

      setUploadProgress({
        status: 'processing',
        progress: 0,
        message: 'Preparing to mint NFT...'
      });

      const tx = await mintDataset(
        name,
        description,
        dataUrl,
        size,
        tokenURI
      );

      console.log('Dataset NFT minted successfully:', tx);

      setUploadProgress({
        status: 'success',
        progress: 100,
        message: 'Dataset NFT minted successfully!'
      });

      return tx;
    } catch (error) {
      console.error('Error minting dataset NFT:', error);
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Error minting dataset NFT'
      });
      throw error;
    }
  };

  return {
    uploadProgress,
    uploadDataset,
    mintDatasetNFT
  };
};