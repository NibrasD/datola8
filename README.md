# Datola Dataset Marketplace

A decentralized marketplace for AI training datasets built on Base network. Datola enables transparent ownership, quality validation, and secure trading of AI datasets using blockchain technology.

## Features

### Dataset Management
- Create and mint dataset NFTs with embedded metadata
- Upload datasets to IPFS with secure access control
- Support for multiple data categories (Text, Image, Audio, Video, Sensor, Mixed)
- Detailed dataset specifications and documentation

### Marketplace
- Browse and search available datasets
- Filter by category, size, and validation status
- Grid and list view options
- Detailed dataset preview pages

### Validation System
- Decentralized dataset validation mechanism
- Stake AGC tokens to become a validator
- Earn rewards for accurate validations
- Reputation scoring system
- Multi-validator consensus for quality assurance

### Revenue Sharing
- Configurable revenue distribution among contributors
- Automatic payment splitting on sales
- Transparent fee structure
- Multiple license tiers with customizable features

### User Dashboard
- Track owned and purchased datasets
- Monitor validation activities
- View earnings and statistics
- Manage dataset listings

### Web3 Integration
- Connect with MetaMask wallet
- Base network support
- AGC token integration for transactions
- NFT-based ownership verification

## Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Smart Contracts**: Solidity
- **Blockchain**: Base Network
- **Storage**: IPFS via Pinata
- **State Management**: TanStack Query
- **Web3**: wagmi, viem
- **UI Components**: Lucide React icons

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Connect your MetaMask wallet to Base network

## Smart Contracts

The platform uses two main smart contracts:

### DatasetNFT.sol
- Handles dataset NFT minting and ownership
- Manages license tiers and access control
- Implements revenue sharing logic

### ValidationContract.sol
- Manages validator staking and rewards
- Coordinates validation sessions
- Tracks validator reputation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License

## Contact

For support or inquiries, please open an issue in the repository.