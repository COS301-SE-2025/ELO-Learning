import '../styles/dashboard.css';
import Header from '../ui/header';
import NavBar from '../ui/nav-bar';

export default function Layout({ children }) {
  return (
    <div className="h-screen flex flex-col md:flex-row md:overflow-hidden">
      {/* Header always on top */}
      <div className="flex-none position-sticky top-0 z-10 w-full md:w-64">
        <Header />
      </div>
      <div className="flex flex-1 flex-col md:flex-row md:overflow-hidden">
        {/* NavBar on the left for desktop */}
        <div className="hidden md:block md:w-64 flex-none">
          <NavBar />
        </div>
        {/* Main content */}
        <div className="main-content flex-grow p-6 md:overflow-y-auto md:p-12">
          {children}
        </div>
      </div>
      {/* NavBar at the bottom for mobile */}
      <div className="block md:hidden w-full flex-none">
        <NavBar />
      </div>
    </div>
  );
}
