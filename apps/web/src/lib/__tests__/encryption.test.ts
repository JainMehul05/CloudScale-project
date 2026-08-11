import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt, serializeEncrypted, deserializeEncrypted } from '../encryption';

describe('Encryption Utilities', () => {
  const testValue = 'test-secret-value-123';
  let encryptedData: Awaited<ReturnType<typeof encrypt>>;

  beforeAll(async () => {
    encryptedData = await encrypt(testValue);
  });

  it('should encrypt a value', async () => {
    expect(encryptedData).toHaveProperty('iv');
    expect(encryptedData).toHaveProperty('tag');
    expect(encryptedData).toHaveProperty('data');
    expect(typeof encryptedData.iv).toBe('string');
    expect(typeof encryptedData.tag).toBe('string');
    expect(typeof encryptedData.data).toBe('string');
  });

  it('should decrypt the encrypted value correctly', async () => {
    const decrypted = await decrypt(encryptedData);
    expect(decrypted).toBe(testValue);
  });

  it('should serialize and deserialize correctly', () => {
    const serialized = serializeEncrypted(encryptedData);
    expect(typeof serialized).toBe('string');

    const deserialized = deserializeEncrypted(serialized);
    expect(deserialized).toEqual(encryptedData);
  });

  it('should produce different ciphertext for same plaintext (IV randomness)', async () => {
    const encrypted1 = await encrypt(testValue);
    const encrypted2 = await encrypt(testValue);
    expect(encrypted1.iv).not.toBe(encrypted2.iv);
    expect(encrypted1.data).not.toBe(encrypted2.data);
  });

  it('should fail to decrypt with wrong key', async () => {
    const wrongKeyData = { ...encryptedData, data: Buffer.from('wrong').toString('base64') };
    await expect(decrypt(wrongKeyData)).rejects.toThrow();
  });
});