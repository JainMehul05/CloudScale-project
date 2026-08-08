export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">
        CloudScale 🚀
      </h1>

      <p className="mt-6 text-xl text-gray-400">
        AI-powered cloud deployment platform
      </p>

      <button className="mt-8 rounded-lg bg-white px-6 py-3 text-black font-semibold">
        Start Deploying
      </button>
    </main>
  );
}