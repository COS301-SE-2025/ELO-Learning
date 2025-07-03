import '../styles/dashboard.css';
import NavBar from '../ui/nav-bar';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Desktop: 2-column layout */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left column - NavBar (1/4) */}
        <div className="w-full flex-none md:w-1/5 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <NavBar />
        </div>

        {/* Middle column - Content (2/4) */}
        <div className=" h-screen flex-grow md:w-4/5 md:overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
