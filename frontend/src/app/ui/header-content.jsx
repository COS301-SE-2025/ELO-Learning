import clsx from 'clsx';

// Simple, reliable icon components using Unicode symbols
const HeartIcon = ({ size = 24 }) => (
  <span 
    style={{ 
      fontSize: `${size}px`, 
      color: '#ef4444', // red color
      display: 'inline-block',
      lineHeight: 1
    }}
  >
    ♥
  </span>
);

const FlameIcon = ({ size = 24 }) => (
  <span 
    style={{ 
      fontSize: `${size}px`, 
      color: '#f97316', // orange color
      display: 'inline-block',
      lineHeight: 1
    }}
  >
    🔥
  </span>
);

const ShieldIcon = ({ size = 24 }) => (
  <span 
    style={{ 
      fontSize: `${size}px`, 
      color: '#3b82f6', // blue color
      display: 'inline-block',
      lineHeight: 1
    }}
  >
    🛡️
  </span>
);

const GaugeIcon = ({ size = 24 }) => (
  <span 
    style={{ 
      fontSize: `${size}px`, 
      color: '#eab308', // yellow color
      display: 'inline-block',
      lineHeight: 1
    }}
  >
    ⚡
  </span>
);

export default function HeaderContent() {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white flex flex-col px-3 py-4 md:static md:h-full md:w-auto md:px-2">
      <div
        className={clsx(
          'flex h-[48px] grow items-center justify-center gap-6 rounded-md p-3 text-sm font-medium md:flex-none md:justify-start md:p-2 md:px-3',
        )}
      >
        <div className="flex items-center gap-2">
          <HeartIcon size={24} />
          <p>5</p>
        </div>
        <div className="flex items-center gap-2">
          <FlameIcon size={24} />
          <p>3</p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldIcon size={24} />
          <p>300xp</p>
        </div>
        <div className="flex items-center gap-2">
          <GaugeIcon size={24} />
          <p>75%</p>
        </div>
      </div>
    </div>
  );
}