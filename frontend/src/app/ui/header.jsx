import HeaderContent from './header-content';
export default function Header() {
  return (
    <div className="header_styling fixed top-0 left-0 w-full h-15 z-50 flex flex-col px-3 py-4 md:static md:h-full md:w-auto md:px-2">
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <HeaderContent />
        <div className="hidden h-auto w-full grow rounded-md md:block"></div>
      </div>
    </div>
  );
}
