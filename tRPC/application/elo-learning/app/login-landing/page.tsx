import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen flex-col gap-4 px-4 md:px-10">
      <div className="flex items-center justify-center flex-col gap-0">
        <Image
          src="/ELO-Learning-Mascot.png"
          width={300}
          height={300}
          className="hidden md:block"
          alt="ELO Learning Mascot"
          priority
        />
        <Image
          src="/ELO-Learning-Mascot.png"
          width={200}
          height={200}
          className="block md:hidden"
          alt="ELO Learning Mascot"
          priority
        />
        <h1 className="logo-text">ELO Learning</h1>
      </div>
      <p className="text-center max-w-md">
        Transform the way you engage with math practice through gamified,
        adaptive learning experiences.
      </p>
      <div className="break"></div>
      <Link className="btn-link" href="/login-landing/signup">
        <button className="main-button w-full">GET STARTED</button>
      </Link>
      <Link className="btn-link" href="/login-landing/login">
        <button className="secondary-button w-full">
          I ALREADY HAVE AN ACCOUNT
        </button>
      </Link>
    </div>
  );
}
