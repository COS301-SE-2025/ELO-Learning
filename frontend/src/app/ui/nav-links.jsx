'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LuCalculator,
  LuHouse,
  LuSwords,
  LuTimer,
  LuUser,
} from 'react-icons/lu';

const links = [
  { name: 'Home', href: '/dashboard', icon: LuHouse },
  { name: 'Practice', href: '/practice', icon: LuCalculator },
  { name: 'Match', href: '/match', icon: LuSwords },
  { name: 'Timed', href: '/timed', icon: LuTimer },
  { name: 'Profile', href: '/profile', icon: LuUser },
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
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-gray-300 text-gray-950': pathname === link.href,
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
