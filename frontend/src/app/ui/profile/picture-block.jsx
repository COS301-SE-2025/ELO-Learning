import Image from 'next/image';

export default function Picture({ src }) {
  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <Image
        src={src || '/user.svg'}
        width={200}
        height={200}
        className="block"
        alt="user profile picture"
        priority
      />
    </div>
  );
}
