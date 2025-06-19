import Image from 'next/image';
export default function Picture() {
  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <Image
        src="/user.svg"
        width={183}
        height={183.18}
        className="block"
        alt="user profile picture"
        priority
      />
    </div>
  );
}
