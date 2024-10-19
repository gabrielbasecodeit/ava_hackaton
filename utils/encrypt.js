const crypto = require("crypto");
const fs = require("fs");

const publicKey = fs.readFileSync("public_key.pem", "utf8");
const privateKey = fs.readFileSync("private_key.pem", "utf8");

function encryptObject(data) {
  const jsonData = JSON.stringify(data);
  const buffer = Buffer.from(jsonData, "utf8");

  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
}

function decryptObject(encryptedData) {
  const buffer = Buffer.from(encryptedData, "base64");

  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
    },
    buffer
  );

  return JSON.parse(decrypted.toString("utf8"));
}

module.exports = {
  encryptObject,
  decryptObject,
};
