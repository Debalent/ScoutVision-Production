import { PROSPECTS } from '../../lib/mock-data';
import ProspectProfileClient from './ProspectProfileClient';

export function generateStaticParams() {
  return PROSPECTS.map((p) => ({ id: p.id }));
}

export default function ProspectProfilePage({ params }: { params: { id: string } }) {
  return <ProspectProfileClient params={params} />;
}
