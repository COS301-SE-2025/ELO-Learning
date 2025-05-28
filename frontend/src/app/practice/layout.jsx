import Link from 'next/link';
import '../styles/dashboard.css';
import Header from '../ui/header';
import NavBar from '../ui/nav-bar';

export default function Layout({ children }) {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-none">
        <Header />
      </div>
      <div className="flex flex-1 flex-col md:flex-row md:overflow-hidden">
        <div className="w-full flex-none md:w-64">
          <NavBar />
        </div>
        <Link href="/question-templates/multiple-choice/q1">
          <div className="main-content flex-grow p-6 md:overflow-y-auto md:p-12">
            {children}
          </div>
        </Link>
      </div>
    </div>
  );
}
