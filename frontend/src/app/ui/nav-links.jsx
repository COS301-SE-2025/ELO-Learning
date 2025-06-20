'use client';

import clsx from 'clsx';
import { Calculator, House, Sword, Swords, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { name: 'Home', href: '/dashboard', icon: House },
  { name: 'Practice', href: '/practice', icon: Calculator },
  { name: 'Match', href: '/match', icon: Swords },
  { name: 'Timed', href: '/single-player', icon: Sword },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'nav-link-item flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-[#e8e8e8] dark:bg-[#7d32ce] text-white':
                  pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" size={32} />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
