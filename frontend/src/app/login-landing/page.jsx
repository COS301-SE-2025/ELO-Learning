import Image from 'next/image';
import Link from 'next/link';
export default function Page() {
  return (
    <div className="flex items-center justify-center h-screen flex-col gap-4 m-10">
      <div className="flex items-center justify-center flex-col gap-0">
        <Image
          src="/ELO-Learning-Mascot.png"
          width={400}
          height={400}
          className="hidden md:block"
          alt="ELO Learning Mascot"
        />
        <Image
          src="/ELO-Learning-Mascot.png"
          width={200}
          height={200}
          className="block md:hidden"
          alt="ELO Learning Mascot"
        />
        <h1 className="logo-text">ELO Learning</h1>
      </div>
      <p className="text-center">
        Transform the way you engage with math practice through gamified,
        adaptive learning experiences.
      </p>
      <div className="break"></div>
      <Link className="btn-link" href="/login-landing/signup">
        <button className="main-button px-2 py-8">GET STARTED</button>
      </Link>
      <Link className="btn-link" href="/login-landing/login">
        <button className="secondary-button px-2 py-8">
          I ALREADY HAVE AN ACCOUNT
        </button>
      </Link>
    </div>
  );
}
