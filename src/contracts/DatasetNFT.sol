// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DatasetNFT
 * @dev Smart contract for creating, managing, and licensing AI training datasets as NFTs
 */
contract DatasetNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // AGC token contract
    IERC20 public immutable agcToken;
    
    // Platform fee percentage (2.5%)
    uint256 public constant PLATFORM_FEE = 250;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Dataset structure
    struct Dataset {
        string title;
        string category;
        string description;
        address[] contributors;
        uint256[] shares;
        bool verified;
        uint256 validationScore;
        bool active;
    }
    
    // License structure
    struct License {
        string tier;
        uint256 price;
        uint256 duration; // in seconds, 0 for perpetual
        string[] features;
    }
    
    // License purchase record
    struct LicensePurchase {
        uint256 datasetId;
        string tier;
        uint256 purchaseTime;
        uint256 expiryTime; // 0 for perpetual
    }
    
    // Mappings
    mapping(uint256 => Dataset) public datasets;
    mapping(uint256 => License[]) public licenses;
    mapping(address => LicensePurchase[]) public userLicenses;
    mapping(uint256 => mapping(address => bool)) public hasAccess;
    mapping(uint256 => mapping(string => uint256)) public licensePrices;
    
    // Events
    event DatasetCreated(uint256 indexed datasetId, address creator, string title);
    event DatasetVerified(uint256 indexed datasetId, uint256 validationScore);
    event LicensePurchased(uint256 indexed datasetId, address buyer, string tier, uint256 price);
    event RevenueDistributed(uint256 indexed datasetId, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _agcToken Address of the AGC token contract
     */
    constructor(address _agcToken) ERC721("AI Dataset NFT", "AINFT") Ownable(msg.sender) {
        require(_agcToken != address(0), "Invalid token address");
        agcToken = IERC20(_agcToken);
    }
    
    /**
     * @dev Checks if a token exists
     */
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    /**
     * @dev Creates a new dataset NFT
     */
    function createDataset(
        string memory _title,
        string memory _category,
        string memory _description,
        address[] memory _contributors,
        uint256[] memory _shares,
        string memory _metadataURI,
        string[] memory _licenseTiers,
        uint256[] memory _licensePrices,
        uint256[] memory _licenseDurations,
        string[][] memory _licenseFeatures
    ) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_category).length > 0, "Category cannot be empty");
        require(_contributors.length == _shares.length, "Contributors and shares must match");
        require(_licenseTiers.length == _licensePrices.length, "License tiers and prices must match");
        require(_licenseTiers.length == _licenseDurations.length, "License tiers and durations must match");
        require(_licenseTiers.length == _licenseFeatures.length, "License tiers and features must match");
        
        // Validate contributors and shares
        uint256 totalShares = 0;
        for (uint256 i = 0; i < _contributors.length; i++) {
            require(_contributors[i] != address(0), "Invalid contributor address");
            require(_shares[i] > 0, "Share must be greater than 0");
            totalShares += _shares[i];
        }
        require(totalShares == 100, "Shares must add up to 100%");
        
        // Create new dataset token
        _tokenIds.increment();
        uint256 newDatasetId = _tokenIds.current();
        _safeMint(msg.sender, newDatasetId);
        _setTokenURI(newDatasetId, _metadataURI);
        
        // Store dataset info
        datasets[newDatasetId] = Dataset({
            title: _title,
            category: _category,
            description: _description,
            contributors: _contributors,
            shares: _shares,
            verified: false,
            validationScore: 0,
            active: true
        });
        
        // Store license info
        for (uint256 i = 0; i < _licenseTiers.length; i++) {
            require(bytes(_licenseTiers[i]).length > 0, "License tier cannot be empty");
            require(_licensePrices[i] > 0, "License price must be greater than 0");
            
            License memory license = License({
                tier: _licenseTiers[i],
                price: _licensePrices[i],
                duration: _licenseDurations[i],
                features: _licenseFeatures[i]
            });
            licenses[newDatasetId].push(license);
            licensePrices[newDatasetId][_licenseTiers[i]] = _licensePrices[i];
        }
        
        emit DatasetCreated(newDatasetId, msg.sender, _title);
        return newDatasetId;
    }
    
    /**
     * @dev Purchases a license for a dataset
     */
    function purchaseLicense(uint256 _datasetId, string memory _tier) public {
        require(_exists(_datasetId), "Dataset does not exist");
        require(datasets[_datasetId].active, "Dataset is not active");
        
        uint256 price = licensePrices[_datasetId][_tier];
        require(price > 0, "Invalid license tier");
        
        // Transfer AGC tokens from buyer to contract
        require(agcToken.transferFrom(msg.sender, address(this), price), "Token transfer failed");
        
        // Find license details
        License memory license;
        bool found = false;
        for (uint256 i = 0; i < licenses[_datasetId].length; i++) {
            if (keccak256(bytes(licenses[_datasetId][i].tier)) == keccak256(bytes(_tier))) {
                license = licenses[_datasetId][i];
                found = true;
                break;
            }
        }
        require(found, "License tier not found");
        
        // Calculate expiry time
        uint256 expiryTime = license.duration > 0 ? block.timestamp + license.duration : 0;
        
        // Record license purchase
        userLicenses[msg.sender].push(LicensePurchase({
            datasetId: _datasetId,
            tier: _tier,
            purchaseTime: block.timestamp,
            expiryTime: expiryTime
        }));
        
        // Grant access
        hasAccess[_datasetId][msg.sender] = true;
        
        // Distribute revenue
        _distributeRevenue(_datasetId, price);
        
        emit LicensePurchased(_datasetId, msg.sender, _tier, price);
    }
    
    /**
     * @dev Distributes revenue from a license purchase
     */
    function _distributeRevenue(uint256 _datasetId, uint256 _amount) internal {
        Dataset storage dataset = datasets[_datasetId];
        
        // Calculate platform fee
        uint256 platformFee = (_amount * PLATFORM_FEE) / FEE_DENOMINATOR;
        uint256 remainingAmount = _amount - platformFee;
        
        // Transfer platform fee
        require(agcToken.transfer(owner(), platformFee), "Platform fee transfer failed");
        
        // Distribute remaining amount to contributors
        for (uint256 i = 0; i < dataset.contributors.length; i++) {
            uint256 contributorShare = (remainingAmount * dataset.shares[i]) / 100;
            if (contributorShare > 0) {
                require(agcToken.transfer(dataset.contributors[i], contributorShare), "Contributor payment failed");
            }
        }
        
        emit RevenueDistributed(_datasetId, _amount);
    }
    
    /**
     * @dev Checks if a user has access to a dataset
     */
    function checkAccess(uint256 _datasetId, address _user) public view returns (bool) {
        if (!hasAccess[_datasetId][_user]) {
            return false;
        }
        
        for (uint256 i = 0; i < userLicenses[_user].length; i++) {
            LicensePurchase memory purchase = userLicenses[_user][i];
            if (purchase.datasetId == _datasetId) {
                if (purchase.expiryTime == 0 || block.timestamp <= purchase.expiryTime) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * @dev Verifies a dataset after validation
     */
    function verifyDataset(uint256 _datasetId, uint256 _validationScore) public onlyOwner {
        require(_exists(_datasetId), "Dataset does not exist");
        require(_validationScore <= 100, "Validation score must be between 0 and 100");
        
        datasets[_datasetId].verified = true;
        datasets[_datasetId].validationScore = _validationScore;
        
        emit DatasetVerified(_datasetId, _validationScore);
    }
    
    /**
     * @dev Sets the active status of a dataset
     */
    function setDatasetActive(uint256 _datasetId, bool _active) public {
        require(_exists(_datasetId), "Dataset does not exist");
        require(ownerOf(_datasetId) == msg.sender || owner() == msg.sender, "Not authorized");
        
        datasets[_datasetId].active = _active;
    }
    
    /**
     * @dev Gets all license tiers for a dataset
     */
    function getDatasetLicenses(uint256 _datasetId) public view returns (License[] memory) {
        require(_exists(_datasetId), "Dataset does not exist");
        return licenses[_datasetId];
    }
    
    /**
     * @dev Gets all licenses purchased by a user
     */
    function getUserLicenses(address _user) public view returns (LicensePurchase[] memory) {
        return userLicenses[_user];
    }
}