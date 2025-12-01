const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { encryptAESGCM } = require("../utils/encrypt");
const { ethers } = require("ethers");

const contractABI = require("../artifacts/contracts/ConsentRegistry.sol/ConsentRegistry.json").abi;
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

const demoPrivateKey = "0x59c6995e998f97a5a0044976f0c1a7f6403d8fd12a943f89fa2a3317c3d1eac4";
const wallet = new ethers.Wallet(demoPrivateKey, provider);

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const consentContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider.getSigner(0));

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/submit-consent", async (req, res) => {
    try {
        const { name, dob, purpose, notes } = req.body;

        const consent = {
            version: "1.0",
            name,
            dob,
            purpose,
            notes,
            timestamp: new Date().toISOString()
        };

        const consentJson = JSON.stringify(consent);
        const consentHash = ethers.utils.keccak256(Buffer.from(consentJson));
        const signature = await wallet.signMessage(ethers.utils.arrayify(consentHash));
        const encrypted = encryptAESGCM(consentJson);

        const outDir = path.join(__dirname, "out");
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

        const fileName = `consent_${Date.now()}.enc.json`;
        const filePath = path.join(outDir, fileName);

        fs.writeFileSync(filePath, JSON.stringify(encrypted, null, 2));

        const tx = await consentContract.recordConsent(
            wallet.address,
            ethers.utils.arrayify(signature),
            consentHash,
            "LOCALFILE:" + fileName
        );

        const receipt = await tx.wait();
        const id = receipt.events[0].args.id.toString();

        return res.json({
            success: true,
            txHash: receipt.transactionHash,
            id,
            file: fileName
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
