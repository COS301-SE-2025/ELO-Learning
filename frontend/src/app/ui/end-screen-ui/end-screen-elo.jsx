'use client';

export default function EndELO({ elo }) {
  return (
    <div className="border-1 border-[#FF6E99] rounded-[10px] w-[90px]">
      <div className="uppercase bg-[#FF6E99] p-2 rounded-t-[9px] text-[14px] font-bold text-center tracking-wide">
        Level
      </div>
      <div className="text-center text-[18px] font-bold py-3 px-5">{elo}</div>
    </div>
  );
}
