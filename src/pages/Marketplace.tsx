import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronDown, 
  Shield, 
  Tag,
  BarChart3,
  Brain,
  Loader,
  ExternalLink
} from 'lucide-react';
import useWeb3 from '../hooks/useWeb3';

const Marketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const { datasets, metadata, isConnected } = useWeb3();

  if (!datasets || !metadata) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 text-purple-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading datasets...</span>
      </div>
    );
  }

  // Combine datasets with their metadata
  const combinedDatasets = datasets.map((dataset, index) => ({
    id: Number(metadata[0][index]),
    name: dataset.name,
    description: dataset.description,
    size: Number(dataset.size),
    dataUrl: dataset.dataUrl,
    tokenURI: metadata[1][index]
  }));

  // Filter and sort datasets
  const filteredDatasets = combinedDatasets
    .filter(dataset => {
      const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dataset.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return b.id - a.id;
      } else if (sortBy === 'oldest') {
        return a.id - b.id;
      }
      return 0;
    });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dataset Marketplace</h1>
        <Link 
          to="/create" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors"
        >
          Create Dataset
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile filters */}
        {filtersOpen && (
          <div className="mt-4 md:hidden grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Showing {filteredDatasets.length} dataset{filteredDatasets.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Dataset grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDatasets.map((dataset) => (
          <Link 
            key={dataset.id}
            to={`/dataset/${dataset.id}`} 
            className="group bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="h-48 bg-gradient-to-r from-purple-400 to-indigo-500 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="h-20 w-20 text-white opacity-20" />
              </div>
              <div className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1 text-sm font-medium text-purple-600">
                #{dataset.id}
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {dataset.name}
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {dataset.description}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-600">
                    {dataset.size.toLocaleString()} bytes
                  </span>
                </div>
                <a 
                  href={dataset.dataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  View Data
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {filteredDatasets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No datasets found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or create a new dataset.
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
  );
};

export default Marketplace;