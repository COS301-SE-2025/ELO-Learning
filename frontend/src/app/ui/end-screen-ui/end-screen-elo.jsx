'use client';
export default function EndELO({ newElo }) {
  const displayElo = newElo != null ? newElo.toFixed(0) : '—';

  return (
    <div className="border-1 border-[#FF6E99] rounded-[10px] w-[120px]">
      <div className="uppercase bg-[#FF6E99] p-2 rounded-t-[9px] text-[14px] font-bold text-center tracking-wide">
        ELO
      </div>
      <div className="text-center text-[18px] font-bold py-3 px-5">
        {displayElo}
      </div>
    </div>
  );
}
