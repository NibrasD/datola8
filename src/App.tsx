import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { WagmiProvider } from 'wagmi';
import { injected } from 'wagmi/connectors';

import Layout from './components/Layout';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import DatasetDetails from './pages/DatasetDetails';
import CreateDataset from './pages/CreateDataset';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Validation from './pages/Validation';

// Create wagmi config
const config = createConfig({
  chains: [base],
  connectors: [
    injected({
      target: 'metaMask',
      shimDisconnect: true,
    }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
});

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/dataset/:id" element={<DatasetDetails />} />
              <Route path="/create" element={<CreateDataset />} />
              <Route path="/profile/:address" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/validation" element={<Validation />} />
            </Routes>
          </Layout>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;