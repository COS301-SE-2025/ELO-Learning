import { MoveLeft } from 'lucide-react';

export default function Back({ pagename }) {
  return (
    <div className="flex flex-row items-center justify-between m-5">
      <MoveLeft size={24} />
      <p className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
        {pagename}
      </p>
      <div className="w-6"></div>
    </div>
  );
}
