const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { encryptAESGCM } = require("../utils/encrypt");
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");


const { ethers } = require("ethers");
const contractABI = require("../artifacts/contracts/ConsentRegistry.sol/ConsentRegistry.json").abi;

// Hardhat localhost blockchain
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

// Use account #0 from Hardhat node
const signer = provider.getSigner(0);

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const consentContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractABI,
    signer
);


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/submit-consent", async (req, res) => {
    try {
        const { name, dob, purpose, notes } = req.body;

        // build consent JSON
        const consent = {
            version: "1.0",
            name,
            dob,
            purpose,
            notes,
            timestamp: new Date().toISOString()
        };

        const consentJson = JSON.stringify(consent);

        // hash
        const consentHash = ethers.utils.keccak256(Buffer.from(consentJson));

        // demo signer wallet
        const wallet = ethers.Wallet.createRandom();

        // sign
        const signature = await wallet.signMessage(ethers.utils.arrayify(consentHash));

        // encrypt
        const encrypted = encryptAESGCM(consentJson);

        // save encrypted file
        const outDir = path.join(__dirname, "out");
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

        const filePath = path.join(outDir, `consent_${Date.now()}.enc.json`);
        fs.writeFileSync(filePath, JSON.stringify(encrypted, null, 2));

            

        // deploy contract or connect to deployed contract
        const [deployer] = await hre.ethers.getSigners();

        const ConsentFactory = await hre.ethers.getContractFactory("ConsentRegistry");
        const contract = await ConsentFactory.deploy();
        await contract.deployed();

        const tx = await contract.recordConsent(
            wallet.address,
            ethers.utils.arrayify(signature),
            consentHash,
            "LOCALFILE:" + path.basename(filePath)
        );

        const receipt = await tx.wait();

        return res.json({
            success: true,
            txHash: receipt.transactionHash
        });

    } catch (err) {
        return res.json({
            success: false,
            error: err.message
        });
    }
});

app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
});

