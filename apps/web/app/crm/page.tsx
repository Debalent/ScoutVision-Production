import { useEffect, useState } from 'react';

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  stage?: { name: string };
  email?: string;
  createdAt: string;
}

export default function CRMPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/prospects')
      .then((res) => res.json())
      .then((data) => {
        setProspects(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Recruiting CRM</h1>
      {loading ? (
        <div>Loading prospects...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-charcoal rounded-xl">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Stage</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => (
                <tr key={p.id} className="border-b border-navy/30">
                  <td className="px-4 py-2 font-semibold">{p.firstName} {p.lastName}</td>
                  <td className="px-4 py-2">{p.stage?.name || '-'}</td>
                  <td className="px-4 py-2">{p.email || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
