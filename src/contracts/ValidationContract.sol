// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IDatasetNFT {
    function verifyDataset(uint256 _datasetId, uint256 _validationScore) external;
}

/**
 * @title ValidationContract
 * @dev Smart contract for validating AI datasets with AGC token incentives
 */
contract ValidationContract is Ownable {
    // AGC token contract
    IERC20 public immutable agcToken;
    
    // DatasetNFT contract interface
    IDatasetNFT public immutable datasetNFT;
    
    // Constants
    uint256 public validationStake = 10000000000000000; // 0.01 AGC
    uint256 public constant SLASHING_PERCENTAGE = 20;
    uint256 public constant VALIDATION_REWARD_PERCENTAGE = 5;
    uint256 public validationThreshold = 3;
    uint256 public validationPeriod = 7 days;
    
    // Session counter
    uint256 private sessionIdCounter;
    
    // Validation session structure
    struct ValidationSession {
        uint256 datasetId;
        uint256 startTime;
        uint256 endTime;
        bool completed;
        address[] validators;
        mapping(address => uint256) scores;
        mapping(address => bool) hasValidated;
        uint256 validationCount;
        uint256 finalScore;
    }
    
    // Validator structure
    struct Validator {
        uint256 stakedAmount;
        uint256 reputation;
        uint256 validationsCompleted;
        bool active;
    }
    
    // Mappings
    mapping(uint256 => ValidationSession) public validationSessions;
    mapping(address => Validator) public validators;
    
    // Events
    event ValidationSessionCreated(uint256 indexed sessionId, uint256 indexed datasetId);
    event ValidatorStaked(address indexed validator, uint256 amount);
    event ValidatorUnstaked(address indexed validator, uint256 amount);
    event ValidationSubmitted(uint256 indexed sessionId, address indexed validator, uint256 score);
    event ValidationCompleted(uint256 indexed sessionId, uint256 indexed datasetId, uint256 finalScore);
    event ValidatorSlashed(address indexed validator, uint256 amount);
    event ValidatorRewarded(address indexed validator, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _agcToken Address of the AGC token contract
     * @param _datasetNFT Address of the DatasetNFT contract
     */
    constructor(address _agcToken, address _datasetNFT) Ownable(msg.sender) {
        require(_agcToken != address(0), "Invalid AGC token address");
        require(_datasetNFT != address(0), "Invalid DatasetNFT address");
        
        agcToken = IERC20(_agcToken);
        datasetNFT = IDatasetNFT(_datasetNFT);
        sessionIdCounter = 0;
    }
    
    /**
     * @dev Get current session counter
     */
    function getSessionCounter() public view returns (uint256) {
        return sessionIdCounter;
    }
    
    /**
     * @dev Stakes AGC tokens to become a validator
     */
    function stakeForValidation(uint256 _amount) public {
        require(_amount >= validationStake, "Must stake minimum amount");
        require(agcToken.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        
        if (!validators[msg.sender].active) {
            validators[msg.sender] = Validator({
                stakedAmount: _amount,
                reputation: 50,
                validationsCompleted: 0,
                active: true
            });
        } else {
            validators[msg.sender].stakedAmount += _amount;
        }
        
        emit ValidatorStaked(msg.sender, _amount);
    }
    
    /**
     * @dev Creates a new validation session for a dataset
     */
    function createValidationSession(uint256 _datasetId) public onlyOwner returns (uint256) {
        sessionIdCounter++;
        uint256 sessionId = sessionIdCounter;
        
        ValidationSession storage session = validationSessions[sessionId];
        session.datasetId = _datasetId;
        session.startTime = block.timestamp;
        session.endTime = block.timestamp + validationPeriod;
        session.completed = false;
        session.validationCount = 0;
        
        emit ValidationSessionCreated(sessionId, _datasetId);
        return sessionId;
    }
    
    /**
     * @dev Submits a validation score for a dataset
     */
    function submitValidation(uint256 _sessionId, uint256 _score) public {
        require(validators[msg.sender].active, "Not an active validator");
        require(validators[msg.sender].stakedAmount >= validationStake, "Insufficient stake");
        require(_score <= 100, "Score must be between 0 and 100");
        
        ValidationSession storage session = validationSessions[_sessionId];
        require(!session.completed, "Validation session completed");
        require(block.timestamp <= session.endTime, "Validation period ended");
        require(!session.hasValidated[msg.sender], "Already validated");
        
        session.validators.push(msg.sender);
        session.scores[msg.sender] = _score;
        session.hasValidated[msg.sender] = true;
        session.validationCount++;
        
        validators[msg.sender].validationsCompleted++;
        
        emit ValidationSubmitted(_sessionId, msg.sender, _score);
        
        if (session.validationCount >= validationThreshold) {
            finalizeValidation(_sessionId);
        }
    }
    
    /**
     * @dev Gets the details of a validator
     */
    function getValidatorDetails(address _validator) public view returns (
        uint256 stakedAmount,
        uint256 reputation,
        uint256 validationsCompleted,
        bool active
    ) {
        Validator memory validator = validators[_validator];
        return (
            validator.stakedAmount,
            validator.reputation,
            validator.validationsCompleted,
            validator.active
        );
    }
    
    /**
     * @dev Gets the validators for a validation session
     */
    function getSessionValidators(uint256 _sessionId) public view returns (address[] memory) {
        return validationSessions[_sessionId].validators;
    }
    
    /**
     * @dev Gets the validation score submitted by a validator
     */
    function getValidationScore(uint256 _sessionId, address _validator) public view returns (uint256) {
        require(validationSessions[_sessionId].hasValidated[_validator], "Validator has not submitted");
        return validationSessions[_sessionId].scores[_validator];
    }
    
    /**
     * @dev Finalizes a validation session
     */
    function finalizeValidation(uint256 _sessionId) internal {
        ValidationSession storage session = validationSessions[_sessionId];
        require(!session.completed, "Validation already completed");
        require(
            session.validationCount >= validationThreshold || block.timestamp > session.endTime,
            "Cannot finalize yet"
        );
        
        uint256[] memory scores = new uint256[](session.validators.length);
        for (uint256 i = 0; i < session.validators.length; i++) {
            scores[i] = session.scores[session.validators[i]];
        }
        
        // Sort scores
        for (uint256 i = 0; i < scores.length; i++) {
            for (uint256 j = i + 1; j < scores.length; j++) {
                if (scores[i] > scores[j]) {
                    uint256 temp = scores[i];
                    scores[i] = scores[j];
                    scores[j] = temp;
                }
            }
        }
        
        // Calculate median
        uint256 finalScore;
        if (scores.length % 2 == 0) {
            finalScore = (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2;
        } else {
            finalScore = scores[scores.length / 2];
        }
        
        session.finalScore = finalScore;
        session.completed = true;
        
        // Call DatasetNFT contract to verify the dataset
        datasetNFT.verifyDataset(session.datasetId, finalScore);
        
        _processValidationRewards(_sessionId, finalScore);
        
        emit ValidationCompleted(_sessionId, session.datasetId, finalScore);
    }
    
    /**
     * @dev Processes rewards and slashing for validators
     */
    function _processValidationRewards(uint256 _sessionId, uint256 _finalScore) internal {
        ValidationSession storage session = validationSessions[_sessionId];
        
        uint256 lowerBound = _finalScore > 10 ? _finalScore - 10 : 0;
        uint256 upperBound = _finalScore < 90 ? _finalScore + 10 : 100;
        
        uint256 totalReward = (validationStake * session.validators.length * VALIDATION_REWARD_PERCENTAGE) / 100;
        
        uint256 accurateValidatorCount = 0;
        for (uint256 i = 0; i < session.validators.length; i++) {
            uint256 score = session.scores[session.validators[i]];
            if (score >= lowerBound && score <= upperBound) {
                accurateValidatorCount++;
            }
        }
        
        if (accurateValidatorCount > 0) {
            uint256 rewardPerValidator = totalReward / accurateValidatorCount;
            
            for (uint256 i = 0; i < session.validators.length; i++) {
                address validator = session.validators[i];
                uint256 score = session.scores[validator];
                
                if (score >= lowerBound && score <= upperBound) {
                    validators[validator].reputation += 1;
                    require(agcToken.transfer(validator, rewardPerValidator), "Reward transfer failed");
                    emit ValidatorRewarded(validator, rewardPerValidator);
                } else {
                    uint256 slashAmount = (validators[validator].stakedAmount * SLASHING_PERCENTAGE) / 100;
                    validators[validator].stakedAmount -= slashAmount;
                    validators[validator].reputation = validators[validator].reputation > 2 ? 
                        validators[validator].reputation - 2 : 0;
                    emit ValidatorSlashed(validator, slashAmount);
                }
            }
        }
    }
}