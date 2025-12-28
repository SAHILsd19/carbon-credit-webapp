const hre = require("hardhat");

async function main() {
    const Contract = await hre.ethers.getContractFactory("CarbonCreditToken");
    const deployed = await Contract.deploy();
    await deployed.waitForDeployment();
    console.log("Contract deployed at:", await deployed.getAddress());
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});