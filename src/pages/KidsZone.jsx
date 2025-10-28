import { Link } from 'react-router-dom';

export default function KidsZone() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Kids Zone</h1>
      <p className="text-gray-600 mb-6">Fun, interactive, and safe learning for kids up to 12 years old. Learn by playing while becoming familiar with LifeSync safety features.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-lg border bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Follow Me Home</h2>
          <p className="text-gray-600 mb-3">Practice safety check-ins with a friendly guide and animated prompts.</p>
          <Link to="/follow-me-home" className="inline-block px-4 py-2 rounded bg-primary-600 text-white">Try Follow Me Home</Link>
        </div>

        <div className="p-5 rounded-lg border bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Hitchhiking Safety</h2>
          <p className="text-gray-600 mb-3">Learn rules for safe lifts with simple scenarios and choices.</p>
          <Link to="/hitchhiking-safety" className="inline-block px-4 py-2 rounded bg-green-600 text-white">Learn Hitchhiking Safety</Link>
        </div>

        <div className="p-5 rounded-lg border bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Emergency Help</h2>
          <p className="text-gray-600 mb-3">Know what to do in an emergency. Practice with kid-friendly drills.</p>
          <Link to="/emergency-assistance" className="inline-block px-4 py-2 rounded bg-red-600 text-white">Emergency Assistance</Link>
        </div>

        <div className="p-5 rounded-lg border bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Ride Share Basics</h2>
          <p className="text-gray-600 mb-3">Understand safe pickups and sharing your trip with guardians.</p>
          <Link to="/ride-sharing" className="inline-block px-4 py-2 rounded bg-indigo-600 text-white">Explore Ride Sharing</Link>
        </div>
      </div>

      <div className="mt-8 p-5 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border">
        <h3 className="text-lg font-semibold mb-2">Coming soon</h3>
        <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
          <li>Mini games that teach location sharing and check-ins</li>
          <li>Story quests for road safety and community helpers</li>
          <li>Badge system linked to your family’s LifeCV</li>
        </ul>
      </div>
    </div>
  );
}
