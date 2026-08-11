import { describe, it, expect } from 'vitest';
import { prisma } from '../prisma';

describe('Prisma Singleton', () => {
  it('should export a PrismaClient instance', () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
    expect(typeof prisma.$disconnect).toBe('function');
    expect(typeof prisma.user).toBe('object');
    expect(typeof prisma.project).toBe('object');
    expect(typeof prisma.deployment).toBe('object');
    expect(typeof prisma.environmentVariable).toBe('object');
  });

  it('should have correct model delegates', () => {
    expect(prisma.user).toHaveProperty('findUnique');
    expect(prisma.user).toHaveProperty('create');
    expect(prisma.project).toHaveProperty('findMany');
    expect(prisma.deployment).toHaveProperty('findUnique');
    expect(prisma.environmentVariable).toHaveProperty('create');
  });
});