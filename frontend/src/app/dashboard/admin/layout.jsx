import '../../styles/dashboard.css';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col md:flex-row">
      {/* Middle column - Content (2/4) */}
      <div className="main-content flex-grow md:w-3/5 md:overflow-y-auto md:m-5 mt-10">
        {children}
      </div>
    </div>
  );
}
