import '../styles/dashboard.css';
import Header from '../ui/header';
import NavBar from '../ui/nav-bar';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Mobile: Show header at top */}
      <div className="flex-none md:hidden">
        <Header />
      </div>

      {/* Desktop: 3-column layout */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left column - NavBar (1/4) */}
        <div className="w-full flex-none md:w-1/5 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <NavBar />
        </div>

        {/* Middle column - Content (2/4) */}
        <div className="flex flex-1 min-h-screen flex-col items-center justify-center md:w-3/5 md:overflow-y-auto">
          {children}
        </div>

        {/* Right column - Header (1/4) - Desktop only */}
        <div className="hidden md:block md:w-1/5 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <Header />
        </div>
      </div>
    </div>
  );
}
