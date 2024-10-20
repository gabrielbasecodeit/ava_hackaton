const SimpleStorage = artifacts.require("SimpleStorage");

module.exports = function(deployer) {
    const tokenAddress = "0x8B3BC4270BE2abbB25BC04717830bd1Cc493a461"; // Replace with your actual token address
    deployer.deploy(SimpleStorage, tokenAddress).then(async (instance) => {
        console.log("SimpleStorage deployed at:", instance.address);
    });
};