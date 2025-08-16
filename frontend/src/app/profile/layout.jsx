import '../styles/dashboard.css';
import NavBar from '../ui/nav-bar';

export default function Layout({ children }) {
  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Desktop: 2-column layout */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left column - NavBar (1/4) */}
        <div className="w-full flex-none md:w-1/5 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <NavBar />
        </div>

        {/* Middle column - Content (2/4) - Added proper scrolling */}
        <div className="flex-grow md:w-4/5 h-screen overflow-y-auto">
          <div className="min-h-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
