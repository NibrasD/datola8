import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  Shield, 
  Coins, 
  ArrowRight,
  Brain,
  FileCheck,
  BarChart3,
  Lock
} from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center pb-8">
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 md:p-16">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The Secure Marketplace for AI Training Datasets
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Buy, sell, and validate high-quality AI training datasets with transparent ownership 
              powered by NFTs on Base mainnet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/marketplace" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Explore Marketplace
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/create" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Create Dataset NFT
              </Link>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Datola enables transparent ownership and quality validation for AI training datasets using blockchain technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dataset NFTs</h3>
            <p className="text-gray-600">
              Mint your AI datasets as unique NFTs with embedded access rights and contributor metadata.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <FileCheck className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Validation</h3>
            <p className="text-gray-600">
              Multi-layer validation system with incentives and reputation scoring for accuracy.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <Coins className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">$AGC Powered</h3>
            <p className="text-gray-600">
              Use $AGC tokens for transactions, validation incentives, and revenue sharing.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Control</h3>
            <p className="text-gray-600">
              Token-gated permissions and tiered licensing for controlled data access.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 rounded-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Marketplace Stats</h2>
          <p className="text-gray-600">Growing ecosystem of AI training datasets</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-4xl font-bold text-purple-600 mb-2">125+</p>
            <p className="text-gray-600">Datasets</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">2.5K+</p>
            <p className="text-gray-600">Users</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">$850K+</p>
            <p className="text-gray-600">Total Volume</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-4xl font-bold text-orange-600 mb-2">98%</p>
            <p className="text-gray-600">Validation Rate</p>
          </div>
        </div>
      </section>

      {/* Featured Datasets */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Datasets</h2>
          <Link to="/marketplace" className="text-purple-600 hover:text-purple-700 font-medium flex items-center">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((id) => (
            <Link 
              key={id}
              to={`/dataset/${id}`} 
              className="group bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="h-48 bg-gradient-to-r from-purple-400 to-indigo-500 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-20 w-20 text-white opacity-20" />
                </div>
                <div className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1 text-sm font-medium text-purple-600">
                  {id === 1 ? 'Image' : id === 2 ? 'Text' : 'Mixed'}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {id === 1 ? 'Facial Expression Dataset' : id === 2 ? 'Multilingual Sentiment' : 'Multimodal Product Data'}
                  </h3>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Verified</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {id === 1 
                    ? 'High-quality facial expression images with emotion labels for computer vision models.' 
                    : id === 2 
                      ? 'Multilingual sentiment analysis dataset covering 12 languages with fine-grained labels.'
                      : 'Combined image and text product data with structured attributes and customer feedback.'}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {id === 1 ? '250K samples' : id === 2 ? '1.2M entries' : '800K records'}
                    </span>
                  </div>
                  <p className="text-purple-600 font-semibold">
                    {id === 1 ? '2,500 AGC' : id === 2 ? '4,800 AGC' : '3,200 AGC'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Contribute?</h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Monetize your AI datasets with transparent ownership and fair revenue sharing.
        </p>
        <Link 
          to="/create" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-purple-700 bg-white hover:bg-gray-50 transition-colors"
        >
          Create Dataset NFT
        </Link>
      </section>
    </div>
  );
};

export default Home;