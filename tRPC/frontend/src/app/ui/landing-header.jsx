import Image from 'next/image';
export default function LandingHeader() {
  return (
    <div className="header-landing fixed top-0 left-0 w-full h-20 z-50 flex flex-row justify-between align-middle px-3 py-4 bg-[#202123] md:px-10">
      <div className="flex items-center justify-center">
        <Image
          src="/ELO-Logo-Horizontal.png"
          width={150}
          height={40}
          className="hidden md:block"
          alt="ELO Learning Mascot"
          priority
        />
        <Image
          src="/ELO-Learning-Mascot.png"
          width={50}
          height={50}
          className="block md:hidden"
          alt="ELO Learning Mascot"
          priority
        />
      </div>
      <div>
        <button className="header-button">Download</button>
      </div>
    </div>
  );
}
