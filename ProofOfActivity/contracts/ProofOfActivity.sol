// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Verifier.sol"; // Ensure this is the correct path to your Verifier contract

contract ProofOfActivityEnhanced is Verifier, AccessControl {
    
    // Define roles
    bytes32 public constant STUDIO_ROLE = keccak256("STUDIO_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Struct Definitions
    struct User {
        address userAddress;
        string role; // e.g., "tester", "developer"
        bool isActive;
        uint256 registeredAt;
    }
    
    struct Activity {
        uint256 id;
        address user;
        string activityType;
        uint256 timestamp;
        string dataURI; // Off-chain data reference (e.g., IPFS URI)
        bool isVerified;
        bool isRewarded;
    }
    
    struct Reward {
        uint256 activityId;
        address recipient;
        uint256 amount;
        uint256 rewardedAt;
    }
    
    // Mappings
    mapping(address => User) public users;
    mapping(uint256 => Activity) public activities;
    mapping(address => uint256[]) public userActivities;
    mapping(uint256 => Reward) public rewards;
    
    uint256 public activityCount;
    
    // Events
    event UserRegistered(address indexed user, string role, uint256 timestamp);
    event ActivitySubmitted(uint256 indexed activityId, address indexed user, string activityType, uint256 timestamp, string dataURI);
    event ActivityVerified(uint256 indexed activityId);
    event RewardDistributed(uint256 indexed activityId, address indexed recipient, uint256 amount);
    
    // Modifiers
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }
    
    modifier onlyStudio() {
        require(hasRole(STUDIO_ROLE, msg.sender), "Caller is not a studio");
        _;
    }
    
    // Constructor to set up roles
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender); // Deployer is the default admin
        _setupRole(ADMIN_ROLE, msg.sender); // Deployer is also an admin
    }
    
    // Function to register a user
    function registerUser(string memory _role) public {
        require(!users[msg.sender].isActive, "User already registered");
        users[msg.sender] = User({
            userAddress: msg.sender,
            role: _role,
            isActive: true,
            registeredAt: block.timestamp
        });
        emit UserRegistered(msg.sender, _role, block.timestamp);
    }
    
    // Function to add a studio
    function addStudio(address _studio) public onlyAdmin {
        grantRole(STUDIO_ROLE, _studio);
    }
    
    // Function to remove a studio
    function removeStudio(address _studio) public onlyAdmin {
        revokeRole(STUDIO_ROLE, _studio);
    }
    
    // Function to submit an activity with ZKP
    function submitActivityWithZKP(
        string memory _activityType,
        string memory _dataURI, // Reference to off-chain data (e.g., IPFS URI)
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[] memory input
    ) public {
        require(users[msg.sender].isActive, "User is not active");
        
        // Verify the proof using the Verifier contract
        bool isValid = verifyProof(a, b, c, input);
        require(isValid, "Invalid ZKP proof");
        
        // Record the activity
        activityCount += 1;
        activities[activityCount] = Activity({
            id: activityCount,
            user: msg.sender,
            activityType: _activityType,
            timestamp: block.timestamp,
            dataURI: _dataURI,
            isVerified: true,
            isRewarded: false
        });
        userActivities[msg.sender].push(activityCount);
        emit ActivitySubmitted(activityCount, msg.sender, _activityType, block.timestamp, _dataURI);
        
        // Distribute reward
        distributeReward(activityCount, calculateReward(_activityType));
    }
    
    // Internal function to distribute rewards
    function distributeReward(uint256 _activityId, uint256 _amount) internal {
        Activity storage activity = activities[_activityId];
        require(activity.isVerified, "Activity not verified");
        require(!activity.isRewarded, "Reward already distributed");
        rewards[_activityId] = Reward({
            activityId: _activityId,
            recipient: activity.user,
            amount: _amount,
            rewardedAt: block.timestamp
        });
        activity.isRewarded = true;
        // Implement token transfer logic here, e.g., ERC20 transfer
        emit RewardDistributed(_activityId, activity.user, _amount);
    }
    
    // Placeholder function for reward calculation
    function calculateReward(string memory _activityType) internal pure returns (uint256) {
        // Define reward logic based on activity type
        if (keccak256(bytes(_activityType)) == keccak256(bytes("gameplay"))) {
            return 10 * 10**18; // Example: 10 tokens
        } else if (keccak256(bytes(_activityType)) == keccak256(bytes("webAppTesting"))) {
            return 15 * 10**18; // Example: 15 tokens
        }
        return 5 * 10**18; // Default reward
    }
    
    // Function for studios to access playtest data
    function getPlaytestData(uint256 _activityId) public view onlyStudio returns (Activity memory) {
        Activity memory activity = activities[_activityId];
        require(activity.id != 0, "Activity does not exist");
        return activity;
    }
    
    // Function to retrieve a user's activities
    function getUserActivities(address _user) public view returns (uint256[] memory) {
        return userActivities[_user];
    }
    
    // Additional functions can be added as needed
}
