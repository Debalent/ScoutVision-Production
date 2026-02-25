import Image from 'next/image';

export default function AppIcon({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/app-icon.png"
      alt="Scout Vision App Icon"
      width={48}
      height={48}
      className={className}
      priority
    />
  );
}
