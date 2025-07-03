interface UsernameBlockProps {
  username: string;
  name: string;
  surname: string;
  date_joined: string;
}

export default function UsernameBlock({
  username,
  name,
  surname,
  date_joined,
}: UsernameBlockProps) {
  return (
    <div className="m-4">
      <h2 className="text-2xl font-bold py-2 uppercase">{username}</h2>
      <div className="flex flex-row">
        <p>
          {name} {surname}
        </p>
        <p className="px-2">•</p>
        <p>Joined: {date_joined}</p>
      </div>
    </div>
  );
}
