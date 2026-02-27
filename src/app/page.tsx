export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold">
          Iconéra – AI Powered Travel Planner 🌍
        </h1>
        <p className="text-gray-400">
          Plan smarter. Travel better.
        </p>
        <a
          href="/trip"
          className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-semibold"
        >
          Create My Trip
        </a>
      </div>
    </main>
  );
}