import NavLinks from './nav-links';
export default function NavBar() {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-white flex flex-col px-3 py-4 md:static md:h-full md:w-auto md:px-2">
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md md:block"></div>
      </div>
    </div>
  );
}
