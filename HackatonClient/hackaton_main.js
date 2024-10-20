const abi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_token",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "promoCode",
          "type": "string"
        }
      ],
      "name": "Redeem",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "amount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "token",
      "outputs": [
        {
          "internalType": "contract IERC20",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "used",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "x",
          "type": "uint256"
        }
      ],
      "name": "set",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "get",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "promoCode",
          "type": "string"
        },
        {
          "internalType": "bytes",
          "name": "signature",
          "type": "bytes"
        }
      ],
      "name": "redeem",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  
const contractAddress = '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922';
  
if (typeof window.ethereum !== 'undefined') {
  var web3 = new Web3(window.ethereum); // Use MetaMask's provider
} else {
  console.log('MetaMask is not installed!');
}

async function connectMetaMask() {
  try {
    // Request MetaMask account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const selectedAccount = accounts[0];

    // Get the current chainId to check if we are on Fuji Testnet (43113)
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });

    document.getElementById('accountDisplay').innerText = `Connected account: ${selectedAccount}`;

    // Fetch balance on Fuji Testnet
    const balance = await web3.eth.getBalance(selectedAccount);
    console.log(`Balance of ${selectedAccount}: ${web3.utils.fromWei(balance, 'ether')} AVAX`);

  } catch (error) {
    console.error('User rejected MetaMask connection or there was an error:', error);
  }
}

// Send data to the contract
        const sendDataToContract = async () => {
            var web3 = new Web3(window.ethereum)
            const accounts = await web3.eth.getAccounts();
            const myContract = new web3.eth.Contract(abi, contractAddress);

            // Create the JSON value to send
            const jsonValue = JSON.stringify({ key: 'value' });

            // Call the set function of the contract
            myContract.methods.set(19).send({ from: accounts[0] })
                .on('transactionHash', (hash) => {
                    console.log(`Transaction sent: ${hash}`);
                })
                .on('receipt', (receipt) => {
                    console.log('Transaction confirmed:', receipt);
					signPromoCode('PROMO123');
                })
                .on('error', (error) => {
                    console.error('Error sending transaction:', error);
                });
        };

// Assuming web3 is already initialized with a provider
const signPromoCode = async (promoCode) => {
    const accounts = await web3.eth.getAccounts();
    const owner = accounts[0];  // Assuming the contract owner is the first account
	
	// Use eth_signTypedData to sign the message
    const signature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [accounts[0], JSON.stringify({
            domain: {
                // Add your domain data here (name, version, etc.)
                name: 'SimpleStorage',
                version: '1',
                chainId: 999, // Example: Fuji Testnet ID
                verifyingContract: '0x8B3BC4270BE2abbB25BC04717830bd1Cc493a461',
            },
            message: {
                promoCode: promoCode,
            },
			primaryType: 'Message', // Define the primary type for the EIP-712 schema
        types: {
            EIP712Domain: [ // Domain type
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
            ],
            Message: [ // Message type
                { name: 'promoCode', type: 'string' },
            ],
        },
        })],
    });

    // Store the signature globally
    window.promoCodeSignature = signature;
	document.getElementById('redeemButton').style.display = "block";
};

document.getElementById('redeemButton').addEventListener('click', async () => {
    const promoCode = 'PROMO123';  // Same promo code
	const promoSignature = window.promoCodeSignature;
	
    if (!promoSignature) {
        console.log('No signature found. Please sign the promo code first.');
        return;
    }

    const accounts = await web3.eth.getAccounts();
    const user = accounts[0];  // User sending the redeem transaction

    const contract = new web3.eth.Contract(abi, contractAddress);
    await contract.methods.redeem(promoCode, promoSignature).send({ from: user })
        .on('receipt', function(receipt) {
            console.log('Reward redeemed successfully:', receipt);
        })
        .on('error', function(error) {
            console.error('Redeem failed:', error);
        });
});


document.getElementById('connectButton').addEventListener('click', connectMetaMask);
document.getElementById('sendDataButton').onclick = sendDataToContract;