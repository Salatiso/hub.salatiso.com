import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ControlCentre() {
  const [activeRide, setActiveRide] = useState(null);
  const [feedbackReports, setFeedbackReports] = useState([]);
  const [escalationStatus, setEscalationStatus] = useState({ stage: 'idle' });

  useEffect(() => {
    // Load data from localStorage
    try {
      const ride = JSON.parse(localStorage.getItem('lifesync_active_ride') || 'null');
      setActiveRide(ride);
    } catch (e) {
      console.warn('Error loading active ride:', e);
    }
    try {
      const reports = JSON.parse(localStorage.getItem('lifesync_feedback_reports') || '[]');
      setFeedbackReports(reports);
    } catch (e) {
      console.warn('Error loading feedback reports:', e);
    }
    try {
      const status = JSON.parse(localStorage.getItem('lifesync_escalation_status') || '{"stage":"idle"}');
      setEscalationStatus(status);
    } catch (e) {
      console.warn('Error loading escalation status:', e);
    }
  }, []);
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Control Centre / Fleet</h1>
        <Link to="/ride-sharing" className="text-primary-600 underline">Back to Ride Sharing</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Live Trips</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Overview of active trips, current locations, and statuses.</p>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {activeRide ? (
              <div className="p-3 border rounded dark:border-gray-700 text-sm">
                <div><strong>Trip ID:</strong> {activeRide.id}</div>
                <div><strong>Driver:</strong> {activeRide.driver?.name || 'Unknown'}</div>
                <div><strong>Status:</strong> {escalationStatus.stage}</div>
                <div><strong>Passengers:</strong> {activeRide.passengers?.length || 0}</div>
              </div>
            ) : (
              <div className="p-3 border rounded dark:border-gray-700 text-sm">No live trips.</div>
            )}
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Escalations & Alerts</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Recent emergency escalations, double-knocks, and resolutions.</p>
          <ul className="mt-3 list-disc pl-5 text-sm">
            {feedbackReports.length > 0 ? (
              feedbackReports.map((report, idx) => (
                <li key={idx}>
                  {report.reason} at {new Date(report.at).toLocaleString()}
                </li>
              ))
            ) : (
              <li>No escalations in the last 24 hours.</li>
            )}
            {escalationStatus.stage !== 'idle' && (
              <li>Current escalation: {escalationStatus.stage}</li>
            )}
          </ul>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Fleet Vehicles</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Manage vehicles, drivers, and compliance. (MVP placeholder)</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 border rounded dark:border-gray-700">No vehicles yet.</div>
            <div className="p-3 border rounded dark:border-gray-700">Add import/export later.</div>
            <div className="p-3 border rounded dark:border-gray-700">Compliance dashboard coming.</div>
          </div>
        </section>
      </div>
    </div>
  );
}
