// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleStorage {
    uint256 private storedData;
    address public owner;
    mapping(bytes32 => bool) public used;

    IERC20 public token; // ERC20 token for rewards
    uint256 public amount = 100; // Amount of tokens for rewards

    event Redeem(address indexed user, uint256 amount, string promoCode);

    constructor(address _token) {
        owner = msg.sender;
        token = IERC20(_token);
    }

    function set(uint256 x) public {
        storedData = x;
    }

    function get() public view returns (uint256) {
        return storedData;
    }

    function redeem(string memory promoCode, bytes memory signature) public {
        bytes32 hash = keccak256(abi.encodePacked(promoCode));
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := and(mload(add(signature, 65)), 255)
        }
        if (v < 27) {
            v += 27;
        }

        require(!used[hash], "Promo code already used");
        used[hash] = true;
        require(ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)), v, r, s) == owner, "Invalid signature");
        
        address user = msg.sender;
        require(token.transferFrom(owner, user, amount), "Transfer failed");
        
        emit Redeem(user, amount, promoCode);
    }
}
