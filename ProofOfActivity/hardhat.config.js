/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      gasPrice: 225000000000, // 225 Gwei
      accounts: [`0x${YOUR_PRIVATE_KEY}`], // Replace with your private key
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      gasPrice: 225000000000,
      accounts: [`0x${d3d66723369cd205a96c20d764060a893f40349e27b279a7939c4c97a093a5d9}`], // Replace with your private key
    },
  },
};
