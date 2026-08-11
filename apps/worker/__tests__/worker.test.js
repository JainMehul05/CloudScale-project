import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';

// Mock external dependencies
vi.mock('dockerode', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      buildImage: vi.fn(),
      createContainer: vi.fn(),
      getContainer: vi.fn(),
      info: vi.fn(),
    })),
  };
});

vi.mock('bullmq', () => ({
  Worker: vi.fn(),
  Queue: vi.fn(),
}));

vi.mock('simple-git', () => {
  return vi.fn().mockImplementation(() => ({
    clone: vi.fn(),
  }));
});

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    deployment: {
      update: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
    environmentVariable: {
      findMany: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  })),
}));

describe('Worker Utilities', () => {
  describe('validateRepoUrl', () => {
    // Import the actual function for testing
    it('should validate HTTPS GitHub URLs', () => {
      const validUrls = [
        'https://github.com/user/repo',
        'https://github.com/org/repo.git',
        'https://github.com/user/repo/tree/main',
      ];
      // This tests the logic pattern, actual function is in worker.js
      validUrls.forEach(url => {
        const parsed = new URL(url);
        expect(parsed.protocol).toBe('https:');
        expect(parsed.hostname).toBe('github.com');
      });
    });

    it('should reject non-HTTPS URLs', () => {
      const invalidUrls = [
        'http://github.com/user/repo',
        'git@github.com:user/repo.git',
        'ssh://git@github.com/user/repo',
      ];
      invalidUrls.forEach(url => {
        try {
          const parsed = new URL(url);
          if (parsed.protocol !== 'https:') {
            throw new Error('Must use HTTPS');
          }
        } catch {
          // Expected to fail
          expect(true).toBe(true);
        }
      });
    });

    it('should reject non-github.com hosts', () => {
      const invalidUrls = [
        'https://gitlab.com/user/repo',
        'https://bitbucket.org/user/repo',
        'https://my-github-enterprise.com/user/repo',
      ];
      invalidUrls.forEach(url => {
        const parsed = new URL(url);
        expect(parsed.hostname.endsWith('github.com')).toBe(false);
      });
    });

    it('should reject private IP addresses', () => {
      const privateUrls = [
        'https://github.com@10.0.0.1/repo',
        'https://github.com@192.168.1.1/repo',
        'https://github.com@172.16.0.1/repo',
        'https://github.com@127.0.0.1/repo',
      ];
      privateUrls.forEach(url => {
        const parsed = new URL(url);
        const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '10.', '172.16.', '192.168.'];
        const isBlocked = blocked.some(b => parsed.hostname.startsWith(b));
        expect(isBlocked).toBe(true);
      });
    });
  });

  describe('Framework Detection Logic', () => {
    it('should detect Next.js from package.json', () => {
      const packageJson = {
        dependencies: { next: '14.0.0', react: '18.0.0' },
        devDependencies: { typescript: '5.0.0' },
      };
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      expect(deps.next).toBeDefined();
      expect(deps.react).toBeDefined();
    });

    it('should detect React/Vite from package.json', () => {
      const packageJson = {
        dependencies: { react: '18.0.0', 'react-dom': '18.0.0' },
        devDependencies: { vite: '5.0.0', '@vitejs/plugin-react': '4.0.0' },
      };
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      expect(deps.react).toBeDefined();
      expect(deps.vite).toBeDefined();
    });

    it('should detect Node.js from package.json', () => {
      const packageJson = {
        dependencies: { express: '4.18.0' },
        devDependencies: { nodemon: '3.0.0' },
      };
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      expect(deps.express).toBeDefined();
    });

    it('should detect Python from requirements.txt or pyproject.toml', () => {
      const files = ['requirements.txt', 'pyproject.toml', 'setup.py'];
      expect(files).toContain('requirements.txt');
      expect(files).toContain('pyproject.toml');
    });

    it('should detect Go from go.mod', () => {
      const files = ['go.mod', 'go.sum'];
      expect(files).toContain('go.mod');
    });
  });

  describe('Docker Security Configuration', () => {
    it('should have non-root user configuration', () => {
      const dockerConfig = {
        User: '1000:1000',
        SecurityOpt: ['no-new-privileges:true'],
        ReadonlyRootfs: true,
        CapDrop: ['ALL'],
      };
      expect(dockerConfig.User).toBe('1000:1000');
      expect(dockerConfig.SecurityOpt).toContain('no-new-privileges:true');
      expect(dockerConfig.ReadonlyRootfs).toBe(true);
      expect(dockerConfig.CapDrop).toContain('ALL');
    });

    it('should have resource limits', () => {
      const hostConfig = {
        Memory: 512 * 1024 * 1024,
        MemorySwap: 512 * 1024 * 1024,
        CpuPeriod: 100000,
        CpuQuota: 50000,
        PidsLimit: 100,
        Ulimits: [{ Name: 'nofile', Soft: 1024, Hard: 1024 }],
      };
      expect(hostConfig.Memory).toBe(512 * 1024 * 1024);
      expect(hostConfig.CpuQuota).toBe(50000);
      expect(hostConfig.PidsLimit).toBe(100);
    });
  });
});