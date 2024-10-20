// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Verifier {
    event ProofVerified(address indexed player, bool success);

    function verifyProof(bytes memory proofData, bytes memory publicInputs) public {
        bool success;
        
        assembly {
            // Load the pointers to the data
            let proofPtr := add(proofData, 0x20)
            let proofSize := mload(proofData)
            let inputsPtr := add(publicInputs, 0x20)
            let inputsSize := mload(publicInputs)

            // Allocate memory for the result
            let result := mload(0x40)
            mstore(result, 0)

            // Call the custom opcode
            // Assume OP_VERIFY_ZKP is 0xB5
            // The opcode pushes 1 (success) or 0 (failure) onto the stack
            success := staticcall(gas(), 0xB5, proofPtr, mload(proofPtr), inputsPtr, mload(inputsPtr))
        

            // Retrieve the result
            result := mload(result)
        }

        require(success == true, "Proof verification failed");

        emit ProofVerified(msg.sender, success);
    }
}
