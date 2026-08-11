import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const ENCRYPTION_KEY = process.env.ENV_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('ENV_ENCRYPTION_KEY environment variable is required but not set');
}

const deriveKey = async (password: string): Promise<Buffer> => {
  const salt = Buffer.from('cloudscale-salt-v1', 'utf8');
  return (await scryptAsync(password, salt, 32)) as Buffer;
};

let cachedKey: Buffer | null = null;

const getKey = async (): Promise<Buffer> => {
  if (!cachedKey) {
    cachedKey = await deriveKey(ENCRYPTION_KEY);
  }
  return cachedKey;
};

export interface EncryptedData {
  iv: string;
  tag: string;
  data: string;
}

export const encrypt = async (plaintext: string): Promise<EncryptedData> => {
  const key = await getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  };
};

export const decrypt = async (encryptedData: EncryptedData): Promise<string> => {
  const key = await getKey();
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const tag = Buffer.from(encryptedData.tag, 'base64');
  const data = Buffer.from(encryptedData.data, 'base64');
  
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
};

export const serializeEncrypted = (encrypted: EncryptedData): string => {
  return JSON.stringify(encrypted);
};

export const deserializeEncrypted = (serialized: string): EncryptedData => {
  return JSON.parse(serialized);
};

export const decryptEnvVarsForDeployment = async (envVars: Array<{ key: string; valueEncrypted: string }>): Promise<Record<string, string>> => {
  const result: Record<string, string> = {};
  for (const env of envVars) {
    if (env.valueEncrypted) {
      try {
        const decryptedData = deserializeEncrypted(env.valueEncrypted);
        result[env.key] = await decrypt(decryptedData);
      } catch {
        // Skip invalid encrypted values
      }
    }
  }
  return result;
};