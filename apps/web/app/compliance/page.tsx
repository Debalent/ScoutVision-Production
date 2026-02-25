import { useEffect, useState } from 'react';

interface ComplianceEvent {
  id: string;
  type: string;
  details?: string;
  createdAt: string;
}

export default function CompliancePage() {
  const [events, setEvents] = useState<ComplianceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/compliance/events')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Compliance Dashboard</h1>
      {loading ? (
        <div>Loading compliance events...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-charcoal rounded-xl">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Details</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-navy/30">
                  <td className="px-4 py-2 font-semibold">{e.type}</td>
                  <td className="px-4 py-2">{e.details || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
