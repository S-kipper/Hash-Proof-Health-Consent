const hre = require("hardhat");

async function main() {
  const ConsentRegistry = await hre.ethers.getContractFactory("ConsentRegistry");
  const consent = await ConsentRegistry.deploy();
  await consent.deployed();
  console.log("ConsentRegistry deployed to:", consent.address);
}

main().catch((err)=>{ console.error(err); process.exit(1);});
