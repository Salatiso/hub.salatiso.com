export default function LifeSyncAcademy() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">LifeSync Academy</h1>
            <p className="text-gray-600 mb-6">Powered by Sazi Life Academy by Salatiso. Learn every feature of LifeSync, from safety tools to ecosystem integrations with The Hub and BizHelp.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-lg border bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Essentials (Lite)</h2>
          <p className="text-gray-600 mb-3">A quick start for new users experimenting with LifeSync.</p>
          <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300 mb-3">
            <li>Follow Me Home basics</li>
            <li>Emergency Assistance</li>
            <li>Hitchhiking Safety</li>
          </ul>
        </div>

        <div className="p-5 rounded-lg border bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Power User</h2>
          <p className="text-gray-600 mb-3">For regular users managing families and communities.</p>
          <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300 mb-3">
            <li>Geofencing & Check-ins</li>
            <li>Community workflows</li>
            <li>Data portability via LifeCV</li>
          </ul>
        </div>

        <div className="p-5 rounded-lg border bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Professional Tracks</h2>
          <p className="text-gray-600 mb-3">Role-specific content for safety monitors and service providers.</p>
          <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300 mb-3">
            <li>Event Safety</li>
            <li>Ride Sharing</li>
            <li>Delivery & Home Services</li>
          </ul>
        </div>

        <div className="p-5 rounded-lg border bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Ecosystem Integration</h2>
          <p className="text-gray-600 mb-3">How LifeSync integrates with The Hub and BizHelp.</p>
          <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300 mb-3">
            <li>Invitations and trust via The Hub</li>
            <li>Professional services via BizHelp</li>
            <li>Sazi Life Academy by Salatiso curriculum pathways</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <a href="https://sazi-life-academy.web.app/" target="_blank" rel="noreferrer" className="px-4 py-2 rounded bg-emerald-600 text-white">Open Sazi Life Academy by Salatiso</a>
        <a href="/onboarding" className="px-4 py-2 rounded bg-primary-600 text-white">Start Onboarding</a>
        <a href="https://the-hub-lifecv.web.app/" target="_blank" rel="noreferrer" className="px-4 py-2 rounded bg-indigo-600 text-white">Open The Hub</a>
        <a href="https://bizhelp-lifecv.web.app/" target="_blank" rel="noreferrer" className="px-4 py-2 rounded bg-blue-600 text-white">Open BizHelp</a>
      </div>
    </div>
  );
}
