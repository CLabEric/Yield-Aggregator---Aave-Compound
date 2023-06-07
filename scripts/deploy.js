// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");

const AAVE_POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const CWETH = "0xA17581A9E3356d9A858b789D68B4d866e593aE94";

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const YieldAggregator = await ethers.getContractFactory("YieldAggregator");
  const yieldAggregator = await YieldAggregator.deploy(AAVE_POOL, WETH, CWETH);
  await yieldAggregator.deployed();

  console.log("YieldAggregator address:", yieldAggregator.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(yieldAggregator);
}

function saveFrontendFiles(yieldAggregator) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ YieldAggregator: yieldAggregator.address }, undefined, 2)
  );

  const YieldAggregatorArtifact = artifacts.readArtifactSync("YieldAggregator");

  fs.writeFileSync(
    path.join(contractsDir, "YieldAggregator.json"),
    JSON.stringify(YieldAggregatorArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
