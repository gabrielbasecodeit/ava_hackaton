const abi = [
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
                })
                .on('error', (error) => {
                    console.error('Error sending transaction:', error);
                });
        };

document.getElementById('connectButton').addEventListener('click', connectMetaMask);
document.getElementById('sendDataButton').onclick = sendDataToContract;