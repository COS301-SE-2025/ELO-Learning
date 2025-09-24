import { useSession } from 'next-auth/react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

// Utility to pick a color based on the user's name
const colors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-gray-500',
];

const getColor = (name) => {
  // Simple hash to pick a color
  const code = name.charCodeAt(0) + name.length;
  return colors[code % colors.length];
};

// Memoized row component to prevent unnecessary re-renders
const UserRow = memo(function UserRow({
  user,
  index,
  isCurrent,
  userRowRef,
  sortType,
  showXP = false,
}) {
  const colorClass = useMemo(() => getColor(user.username), [user.username]);
  const initial = useMemo(() => user.username.charAt(0), [user.username]);
  const formattedValue = useMemo(() => {
    if (sortType === 'elo') {
      if (typeof user.elo === 'number') return user.elo.toFixed(0);
      if (typeof user.elo_rating === 'number')
        return user.elo_rating.toFixed(0);
      return '-';
    }
    return typeof user.xp === 'number' ? user.xp.toFixed(0) : '-';
  }, [user.xp, user.elo, user.elo_rating, sortType]);
  const valueLabel = sortType === 'elo' ? '' : 'XP';

  return (
    <tr
      key={user.id}
      ref={isCurrent ? userRowRef : null}
      className={isCurrent ? 'bg-[var(--vector-violet-light)] font-bold' : ''}
    >
      <td className="p-2">{index + 1}</td>
      <td className="p-2">
        <span
          className={`inline-flex items-center justify-center rounded-full w-8 h-8 font-bold text-lg ${colorClass}`}
        >
          {initial}
        </span>
      </td>
      <td className="text-left p-2">
        <span 
          className="truncate block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap"
          title={user.username}
        >
          {user.username}
        </span>
      </td>
      <td className="text-right p-2">
        {formattedValue} {valueLabel}
      </td>
      {showXP && (
        <td className="text-right p-2">
          {typeof user.xp === 'number' ? user.xp.toFixed(0) : '-'} XP
        </td>
      )}
    </tr>
  );
});

// Custom dropdown component for XP/ELO sort
function DropdownSort({ sortType, onSortTypeChange, onOpenChange }) {
  const [open, setOpen] = useState(false);
  const options = [
    { value: 'xp', label: 'XP' },
    { value: 'elo', label: 'ELO' },
  ];
  // Close dropdown on outside click
  const ref = useRef();
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        onOpenChange?.(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onOpenChange]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  return (
    <div className="relative inline-block text-left w-full" ref={ref}>
      <button
        className="flex items-center gap-1 font-bold px-2 py-1 rounded cursor-pointer hover:bg-[var(--radical-rose)] focus:outline-none w-full justify-end"
        onClick={() => {
          setOpen((v) => !v);
          onOpenChange?.(!open);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        tabIndex={0}
        type="button"
      >
        {sortType === 'elo' ? 'ELO' : 'XP'}
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute right-0 z-[99] mt-1 w-24 bg-[var(--color-background)] border border-[#444] rounded-lg shadow-lg py-1"
          style={{ minWidth: '80px' }}
          role="listbox"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`px-4 py-2 flex items-center gap-2 cursor-pointer select-none ${
                sortType === opt.value
                  ? 'bg-[var(--radical-rose)] text-[var(--color-foreground)] font-bold'
                  : 'hover:bg-[var(--color-background)] text-[var(--color-foreground)]'
              }`}
              onClick={() => {
                onSortTypeChange?.(opt.value);
                setOpen(false);
                onOpenChange?.(false);
              }}
              role="option"
              aria-selected={sortType === opt.value}
            >
              {sortType === opt.value && (
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const LeaderboardTable = memo(function LeaderboardTable({
  users = [],
  sortType = 'xp',
  onSortTypeChange,
  showXP = false,
}) {
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentUserRowRef = useRef(null);

  // Memoize current user to avoid unnecessary updates
  const memoizedCurrentUser = useMemo(() => {
    return session?.user || null;
  }, [session?.user?.id]); // Only re-run if user ID changes

  useEffect(() => {
    setCurrentUser(memoizedCurrentUser);
  }, [memoizedCurrentUser]);

  // Scroll to current user with debouncing
  useEffect(() => {
    if (currentUserRowRef.current && currentUser && users.length > 0) {
      const timeoutId = setTimeout(() => {
        currentUserRowRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [currentUser, users.length]);

  // Memoize rendered rows to prevent unnecessary re-renders
  const renderedRows = useMemo(() => {
    return users.map((user, idx) => {
      const isCurrent = currentUser && user.id === currentUser.id;
      return (
        <UserRow
          key={user.id}
          user={user}
          index={idx}
          isCurrent={isCurrent}
          userRowRef={isCurrent ? currentUserRowRef : null}
          sortType={sortType}
          showXP={showXP}
        />
      );
    });
  }, [users, currentUser, sortType, showXP]);

  return (
    <div
      className="border rounded-lg p-4 mx-4 mb-15 md:mx-0 overflow-x-auto"
      style={{
        maxHeight: '100%',
        overflowY: dropdownOpen ? 'visible' : 'auto',
        overflow: dropdownOpen ? 'visible' : undefined,
      }}
    >
      <table className="table-auto w-full text-center min-w-0">
        <thead>
          <tr>
            <th className="w-0.5/5">#</th>
            <th className="w-1.5/5"></th>
            <th className="text-left px-3 w-1/5 min-w-0">Username</th>
            <th className="text-right px-3 w-2/5 relative">
              <DropdownSort
                sortType={sortType}
                onSortTypeChange={onSortTypeChange}
                onOpenChange={setDropdownOpen}
              />
            </th>
            {showXP && <th className="text-right px-3 w-2/5">XP</th>}
          </tr>
        </thead>
        <tbody>{renderedRows}</tbody>
      </table>
    </div>
  );
});

export default LeaderboardTable;
