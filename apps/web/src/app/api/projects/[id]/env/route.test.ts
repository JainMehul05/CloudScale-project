import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock the prisma module
vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
    },
    environmentVariable: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock the encryption module
vi.mock('@/lib/encryption', () => ({
  encrypt: vi.fn(),
  serializeEncrypted: vi.fn(),
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encrypt, serializeEncrypted } from '@/lib/encryption';
import { POST } from '@/app/api/projects/[id]/env/route';

const mockAuth = auth as Mock;
const mockPrismaProjectFindUnique = prisma.project.findUnique as Mock;
const mockPrismaEnvVarFindUnique = prisma.environmentVariable.findUnique as Mock;
const mockPrismaEnvVarCreate = prisma.environmentVariable.create as Mock;
const mockEncrypt = encrypt as Mock;
const mockSerializeEncrypted = serializeEncrypted as Mock;

describe('POST /api/projects/[id]/env', () => {
  const mockSession = { user: { id: 'user-123' } };
  const mockProject = { id: 'project-123', userId: 'user-123' };
  const mockEncrypted = { iv: 'iv', tag: 'tag', data: 'data' };
  const mockSerialized = 'serialized';
  const mockEnvVar = { id: 'env-123', key: 'TEST_KEY', createdAt: '2026-08-11T20:55:40.326Z', updatedAt: '2026-08-11T20:55:40.326Z' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(mockSession);
    mockPrismaProjectFindUnique.mockResolvedValue(mockProject);
    mockPrismaEnvVarFindUnique.mockResolvedValue(null);
    mockEncrypt.mockResolvedValue(mockEncrypted);
    mockSerializeEncrypted.mockReturnValue(mockSerialized);
    mockPrismaEnvVarCreate.mockResolvedValue(mockEnvVar);
  });

  it('should create environment variable successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/projects/project-123/env', {
      method: 'POST',
      body: JSON.stringify({ key: 'TEST_KEY', value: 'test-value' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const params = Promise.resolve({ id: 'project-123' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(mockEnvVar);
    expect(mockAuth).toHaveBeenCalled();
    expect(mockPrismaProjectFindUnique).toHaveBeenCalledWith({ where: { id: 'project-123' } });
    expect(mockEncrypt).toHaveBeenCalledWith('test-value');
    expect(mockPrismaEnvVarCreate).toHaveBeenCalledWith({
      data: {
        projectId: 'project-123',
        key: 'TEST_KEY',
        valueEncrypted: mockSerialized,
      },
      select: { id: true, key: true, createdAt: true, updatedAt: true },
    });
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    
    const request = new NextRequest('http://localhost:3000/api/projects/project-123/env', {
      method: 'POST',
      body: JSON.stringify({ key: 'TEST_KEY', value: 'test-value' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const params = Promise.resolve({ id: 'project-123' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 403 if not project owner', async () => {
    mockPrismaProjectFindUnique.mockResolvedValue({ id: 'project-123', userId: 'other-user' });
    
    const request = new NextRequest('http://localhost:3000/api/projects/project-123/env', {
      method: 'POST',
      body: JSON.stringify({ key: 'TEST_KEY', value: 'test-value' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const params = Promise.resolve({ id: 'project-123' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('should return 403 if project not found (ownership check fails)', async () => {
    mockPrismaProjectFindUnique.mockResolvedValue(null);
    
    const request = new NextRequest('http://localhost:3000/api/projects/project-123/env', {
      method: 'POST',
      body: JSON.stringify({ key: 'TEST_KEY', value: 'test-value' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const params = Promise.resolve({ id: 'project-123' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('should return 400 if key or value missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/projects/project-123/env', {
      method: 'POST',
      body: JSON.stringify({ key: '', value: 'test-value' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const params = Promise.resolve({ id: 'project-123' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Key and value are required');
  });

  it('should return 400 if key format invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/projects/project-123/env', {
      method: 'POST',
      body: JSON.stringify({ key: 'invalid-key!', value: 'test-value' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const params = Promise.resolve({ id: 'project-123' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid key format');
  });

  it('should return 409 if key already exists', async () => {
    mockPrismaEnvVarFindUnique.mockResolvedValue({ id: 'existing' });
    
    const request = new NextRequest('http://localhost:3000/api/projects/project-123/env', {
      method: 'POST',
      body: JSON.stringify({ key: 'TEST_KEY', value: 'test-value' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const params = Promise.resolve({ id: 'project-123' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('Environment variable with this key already exists');
  });
});