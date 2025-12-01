const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// AES-GCM decrypt function
function decryptAESGCM(keyHex, ivHex, tagHex, ciphertextHex) {
    const key = Buffer.from(keyHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
    ]);

    return decrypted.toString("utf8");
}


const encryptedFile = path.join(__dirname, "out", "consent_1764320955615.enc.json");

// Read file
const data = JSON.parse(fs.readFileSync(encryptedFile, "utf8"));

const decrypted = decryptAESGCM(data.key, data.iv, data.tag, data.ciphertext);

console.log("\nDecrypted Consent JSON:\n");
console.log(decrypted);
