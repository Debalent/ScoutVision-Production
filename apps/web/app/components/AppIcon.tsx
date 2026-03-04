import Image from 'next/image';
import appIconImg from '../../public/app-icon.png';

export default function AppIcon({ className = '' }: { className?: string }) {
  return (
    <Image
      src={appIconImg}
      alt="Scout Vision App Icon"
      width={48}
      height={48}
      className={className}
      priority
    />
  );
}
