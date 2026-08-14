import fs from "fs";
import path from "path";


// Load .env FIRST
const envPath = path.join(process.cwd(), ".env");

const envFile = fs.readFileSync(envPath, "utf8");


for (const line of envFile.split("\n")) {

  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    continue;
  }

  const index = trimmed.indexOf("=");

  if (index === -1) {
    continue;
  }

  const key = trimmed
    .substring(0, index)
    .trim();


  const value = trimmed
    .substring(index + 1)
    .trim()
    .replace(/^"/, "")
    .replace(/"$/, "");


  process.env[key] = value;
}


console.log(
  "ENV_ENCRYPTION_KEY loaded:",
  !!process.env.ENV_ENCRYPTION_KEY
);


// Import AFTER environment loading
async function test() {

  const {
    decrypt,
    deserializeEncrypted,
  } = await import("./encryption");


  const encrypted = `
{
"iv":"gxPjSY7LdggEXFmo",
"tag":"sN/bM0eda5fVcXVGm+ZgMw==",
"data":"iUrW7/Acx014NOZdc7yJMj2gYLZMFKBQlA=="
}
`;


  const data =
    deserializeEncrypted(encrypted);


  const value =
    await decrypt(data);


  console.log("Decrypted value:");
  console.log(value);

}


test();