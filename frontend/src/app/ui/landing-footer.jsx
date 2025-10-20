'use client';
import Image from 'next/image';
import Link from 'next/link';
export default function LandingFooter() {
  return (
    <div className=" bg-[#1D1A34] px-3 py-8 w-full md:p-10">
      <div className="flex flex-row gap-2 justify-between">
        <div className="space-y-2">
          <Link href="/privacy-policy">
            <p className="hover:text-[#BD86F8] transition-colors">
              Privacy Policy
            </p>
          </Link>
          <Link href="/terms-of-service">
            <p className="hover:text-[#BD86F8] transition-colors">
              Terms of Service
            </p>
          </Link>
          <Link href="/help">
            <p className="hover:text-[#BD86F8] transition-colors">Help</p>
          </Link>
        </div>
        <div>
          <Image
            src="/Light-horizontal.png"
            width={150}
            height={50}
            className="block md:hidden"
            alt="ELO Learning Horizontal Logo"
            priority
          />
          <Image
            src="/Light-horizontal.png"
            width={250}
            height={100}
            className="hidden md:block"
            alt="ELO Learning Horizontal Logo"
            priority
          />
        </div>
      </div>
      <div className="text-sm text-center mt-5">
        <p>
          Created by Zero Day | in collaboration with&nbsp;
          <Link href="https://proking.solutions/" target="_blank">
            <span className="underline">Proking Solutions</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
