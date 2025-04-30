import React, { useState } from 'react';
import { 
  Upload, 
  FileCheck, 
  Tag, 
  Users,
  Info,
  Check,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useDataset } from '../hooks/useDataset';
import UploadProgress from '../components/UploadProgress';

type ContributorType = {
  address: string;
  role: string;
  share: number;
};

type LicenseType = {
  tier: string;
  price: string;
  features: string[];
};

const CreateDataset: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [contributors, setContributors] = useState<ContributorType[]>([
    { address: '', role: 'Creator', share: 100 }
  ]);
  const [licenses, setLicenses] = useState<LicenseType[]>([
    { 
      tier: 'Basic', 
      price: '', 
      features: ['Research use', 'Non-commercial applications', '12-month access']
    }
  ]);
  const [fileSelected, setFileSelected] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { uploadProgress, uploadDataset, mintDatasetNFT } = useDataset();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadataURI, setMetadataURI] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileSelected(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      const uri = await uploadDataset(selectedFile);
      setMetadataURI(uri);
    } catch (error) {
      console.error('Error uploading dataset:', error);
    }
  };

  const handleMintNFT = async () => {
    if (!metadataURI) return;

    try {
      const licenseTiers = licenses.map(l => l.tier);
      const licensePrices = licenses.map(l => l.price);
      const licenseDurations = licenses.map(() => 0); // Set appropriate durations
      const licenseFeatures = licenses.map(l => l.features);

      await mintDatasetNFT(
        title,
        category,
        description,
        contributors.map(c => c.address),
        contributors.map(c => c.share),
        metadataURI,
        licenseTiers,
        licensePrices,
        licenseDurations,
        licenseFeatures
      );
    } catch (error) {
      console.error('Error minting dataset NFT:', error);
    }
  };

  const handleAddContributor = () => {
    const totalShare = contributors.reduce((sum, contributor) => sum + contributor.share, 0);
    const defaultShare = totalShare < 100 ? 100 - totalShare : 0;
    
    setContributors([
      ...contributors, 
      { address: '', role: 'Contributor', share: defaultShare }
    ]);
  };

  const handleRemoveContributor = (index: number) => {
    if (contributors.length > 1) {
      const newContributors = contributors.filter((_, i) => i !== index);
      if (index !== 0 && contributors[index].share > 0) {
        newContributors[0].share += contributors[index].share;
      }
      setContributors(newContributors);
    }
  };

  const handleContributorChange = (index: number, field: keyof ContributorType, value: string | number) => {
    const newContributors = [...contributors];
    
    if (field === 'share') {
      const shareValue = typeof value === 'string' ? parseInt(value) : value;
      newContributors[index].share = Math.max(0, Math.min(100, isNaN(shareValue) ? 0 : shareValue));
      
      const totalShare = newContributors.reduce((sum, contributor, i) => 
        i === index ? sum : sum + contributor.share, newContributors[index].share);
      
      if (totalShare > 100) {
        const excess = totalShare - 100;
        const otherTotalShare = totalShare - newContributors[index].share;
        
        if (otherTotalShare > 0) {
          newContributors.forEach((contributor, i) => {
            if (i !== index) {
              const reduction = (contributor.share / otherTotalShare) * excess;
              contributor.share = Math.max(0, contributor.share - reduction);
            }
          });
        } else {
          newContributors[index].share = 100;
        }
      }
    } else {
      (newContributors[index][field] as any) = value;
    }
    
    setContributors(newContributors);
  };

  const handleAddLicense = () => {
    setLicenses([
      ...licenses,
      { tier: '', price: '', features: [''] }
    ]);
  };

  const handleRemoveLicense = (index: number) => {
    if (licenses.length > 1) {
      setLicenses(licenses.filter((_, i) => i !== index));
    }
  };

  const handleLicenseChange = (index: number, field: keyof LicenseType, value: string) => {
    const newLicenses = [...licenses];
    (newLicenses[index][field] as any) = value;
    setLicenses(newLicenses);
  };

  const handleFeatureChange = (licenseIndex: number, featureIndex: number, value: string) => {
    const newLicenses = [...licenses];
    newLicenses[licenseIndex].features[featureIndex] = value;
    setLicenses(newLicenses);
  };

  const handleAddFeature = (licenseIndex: number) => {
    const newLicenses = [...licenses];
    newLicenses[licenseIndex].features.push('');
    setLicenses(newLicenses);
  };

  const handleRemoveFeature = (licenseIndex: number, featureIndex: number) => {
    if (licenses[licenseIndex].features.length > 1) {
      const newLicenses = [...licenses];
      newLicenses[licenseIndex].features = newLicenses[licenseIndex].features.filter((_, i) => i !== featureIndex);
      setLicenses(newLicenses);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return title.trim() !== '' && description.trim() !== '' && category.trim() !== '';
      case 2:
        return fileSelected && metadataURI !== '';
      case 3:
        return contributors.every(c => c.address.trim() !== '') && 
               licenses.every(l => l.tier.trim() !== '' && l.price.trim() !== '');
      case 4:
        return acceptedTerms;
      default:
        return false;
    }
  };

  const totalShare = contributors.reduce((sum, contributor) => sum + contributor.share, 0);
  const isShareValid = totalShare === 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Dataset NFT</h1>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {['Basic Info', 'Upload Data', 'Contributors', 'Licensing'].map((step, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center"
                style={{ width: '25%' }}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1
                    ${index + 1 < currentStep ? 'bg-green-100 text-green-700 border-2 border-green-500' : 
                      index + 1 === currentStep ? 'bg-purple-100 text-purple-700 border-2 border-purple-500' : 
                      'bg-gray-100 text-gray-500 border-2 border-gray-300'}`}
                >
                  {index + 1 < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className={`text-xs text-center ${index + 1 === currentStep ? 'text-purple-700 font-medium' : 'text-gray-500'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
          <div className="relative w-full bg-gray-200 h-1 rounded-full">
            <div 
              className="absolute top-0 left-0 bg-purple-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep - 1) * 33.33}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Dataset Title *
              </label>
              <input
                type="text"
                id="title"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Enter a descriptive title for your dataset"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="Text">Text</option>
                <option value="Image">Image</option>
                <option value="Audio">Audio</option>
                <option value="Video">Video</option>
                <option value="Sensor">Sensor</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                rows={5}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Provide a detailed description of your dataset"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Upload Data */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Dataset</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="dataset-upload"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-1 text-sm text-gray-600">
                Drag and drop your dataset files here, or click to browse
              </p>
              <div className="mt-4">
                <label
                  htmlFor="dataset-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 cursor-pointer"
                >
                  Browse Files
                </label>
              </div>
            </div>

            {selectedFile && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start">
                  <FileCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-green-800">File Selected</h3>
                    <p className="text-sm text-green-700 mt-1">
                      {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                    <UploadProgress {...uploadProgress} />
                    {uploadProgress.status === 'idle' && (
                      <button
                        onClick={handleUpload}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                      >
                        Upload Dataset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Contributors */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contributors & Revenue Sharing</h2>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-medium text-gray-900">Contributors</h3>
                  <div className="text-sm">
                    <span className={`font-medium ${isShareValid ? 'text-green-600' : 'text-red-600'}`}>
                      Total: {totalShare}%
                    </span>
                    {!isShareValid && (
                      <span className="text-red-600 ml-1">(Must equal 100%)</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {contributors.map((contributor, index) => (
                  <div key={index} className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-grow">
                        <label htmlFor={`address-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Wallet Address *
                        </label>
                        <input
                          type="text"
                          id={`address-${index}`}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="0x..."
                          value={contributor.address}
                          onChange={(e) => handleContributorChange(index, 'address', e.target.value)}
                          required
                        />
                      </div>
                      <div className="sm:w-32">
                        <label htmlFor={`role-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <select
                          id={`role-${index}`}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          value={contributor.role}
                          onChange={(e) => handleContributorChange(index, 'role', e.target.value)}
                        >
                          <option value="Creator">Creator</option>
                          <option value="Contributor">Contributor</option>
                          <option value="Curator">Curator</option>
                          <option value="Validator">Validator</option>
                        </select>
                      </div>
                      <div className="sm:w-24">
                        <label htmlFor={`share-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Share % *
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            id={`share-${index}`}
                            min="0"
                            max="100"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            value={contributor.share}
                            onChange={(e) => handleContributorChange(index, 'share', e.target.value)}
                            required
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </div>
                      <div className="flex items-end">
                        {index > 0 && (
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            onClick={() => handleRemoveContributor(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={handleAddContributor}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Contributor
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-md font-medium text-gray-900">License Tiers</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {licenses.map((license, licenseIndex) => (
                  <div key={licenseIndex} className="p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow">
                          <label htmlFor={`tier-${licenseIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                            License Tier *
                          </label>
                          <input
                            type="text"
                            id={`tier-${licenseIndex}`}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            placeholder="e.g., Basic, Premium, Enterprise"
                            value={license.tier}
                            onChange={(e) => handleLicenseChange(licenseIndex, 'tier', e.target.value)}
                            required
                          />
                        </div>
                        <div className="sm:w-48">
                          <label htmlFor={`price-${licenseIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Price (AGC) *
                          </label>
                          <div className="flex items-center">
                            <input
                              type="text"
                              id={`price-${licenseIndex}`}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                              placeholder="e.g., 1000"
                              value={license.price}
                              onChange={(e) => handleLicenseChange(licenseIndex, 'price', e.target.value)}
                              required
                            />
                            <span className="ml-2">AGC</span>
                          </div>
                        </div>
                        <div className="flex items-end">
                          {licenseIndex > 0 && (
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              onClick={() => handleRemoveLicense(licenseIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License Features
                        </label>
                        <div className="space-y-2">
                          {license.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                placeholder="e.g., Research use only"
                                value={feature}
                                onChange={(e) => handleFeatureChange(licenseIndex, featureIndex, e.target.value)}
                              />
                              {license.features.length > 1 && (
                                <button
                                  type="button"
                                  className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                  onClick={() => handleRemoveFeature(licenseIndex, featureIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            onClick={() => handleAddFeature(licenseIndex)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Feature
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={handleAddLicense}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add License Tier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Terms */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms and Conditions</h2>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-4 text-sm text-gray-600">
                <p className="mb-2">By minting this dataset as an NFT, you agree to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Confirm you have the rights to distribute this data</li>
                  <li>Adhere to ethical AI principles and data privacy regulations</li>
                  <li>Allow AGChain to validate the dataset quality</li>
                  <li>Accept a 2.5% platform fee on all license sales</li>
                  <li>Maintain the dataset's availability for the duration of all license periods</li>
                </ul>
              </div>
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the AGChain Dataset Marketplace terms and conditions
                </label>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-purple-800">Ready to Mint</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    Your dataset NFT will be minted on the Base network. This process may take a few minutes to complete.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
              currentStep === 1 ? 'text-gray-500 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Back
          </button>
          <button
            type="button"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
              !isStepComplete() 
                ? 'text-gray-300 bg-gray-100 cursor-not-allowed' 
                : currentStep === 4 
                  ? 'text-white bg-green-600 hover:bg-green-700' 
                  : 'text-white bg-purple-600 hover:bg-purple-700'
            }`}
            onClick={currentStep === 4 ? handleMintNFT : nextStep}
            disabled={!isStepComplete()}
          >
            {currentStep === 4 ? 'Mint Dataset NFT' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDataset;