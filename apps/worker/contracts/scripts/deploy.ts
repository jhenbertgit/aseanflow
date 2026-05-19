import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH`);
  console.log(`Network: ${hre.network.name} (chain ${hre.network.config.chainId})`);

  const AFT = await hre.ethers.getContractFactory("AseanFlowToken");
  const aft = await AFT.deploy();
  await aft.waitForDeployment();

  const address = await aft.getAddress();
  console.log(`\nDeployed AseanFlowToken (AFT) at: ${address}`);
  console.log(`Explorer: https://explorer-hoodi.morph.network/address/${address}`);
  console.log(`\nAdd to apps/worker/.env:\nREWARD_TOKEN_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error("Deploy failed:", err);
  process.exit(1);
});
