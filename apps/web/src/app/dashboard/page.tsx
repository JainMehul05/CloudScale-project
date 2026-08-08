'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, githubRepo }),
    });

    if (res.ok) {
      setName('');
      setGithubRepo('');
      fetchProjects();
    } else {
      alert('Failed to create project');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">CloudScale Dashboard</h1>

      {/* Deploy Form */}
      <form onSubmit={handleCreateProject} className="bg-gray-100 p-6 rounded-lg mb-8 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-black">Deploy New Repository</h2>
        <input
          type="text"
          placeholder="Project Name (e.g., my-app)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-3 border rounded text-black bg-white"
          required
        />
        <input
          type="text"
          placeholder="GitHub Repo URL (e.g., https://github.com/user/repo)"
          value={githubRepo}
          onChange={(e) => setGithubRepo(e.target.value)}
          className="p-3 border rounded text-black bg-white"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Deploy Project'}
        </button>
      </form>

      {/* Projects List */}
      <h2 className="text-2xl font-bold mb-4">Active Projects</h2>
      <div className="grid gap-4">
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects deployed yet.</p>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="border p-4 rounded-lg flex justify-between items-center shadow-sm">
              <div>
                <h3 className="text-lg font-bold">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.githubRepo}</p>
                <p className="text-xs text-blue-600 mt-1">Bound Host Port: {p.port}</p>
              </div>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">
                {p.deployments?.[0]?.status || 'PENDING'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}