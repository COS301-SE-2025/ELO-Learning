'use client';
import Back from '@/app/ui/back';
import { performLogout } from '@/lib/logout';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const handleLogout = async () => {
    await performLogout();
  };

  return (
    <div className="h-full flex flex-col">
      <div>
        <Back pagename="Settings" />
      </div>
      <div className="flex-1 my-4 mx-7">
        <div className="mt-10">
          <h2 className="uppercase text-lg font-bold">Account</h2>
          <div className="border border-[#696969] my-5 rounded-lg">
            <div className="flex flex-row justify-between p-3 border-b border-[#696969]">
              <div>Preferences</div>
              <ChevronRight />
            </div>
            <div className="flex flex-row justify-between p-3 border-b border-[#696969]">
              <div>Profile</div>
              <ChevronRight />
            </div>
            <Link href="/settings/change-password">
              <div className="flex flex-row justify-between p-3 border-b border-[#696969] hover:bg-[#1d1a34]">
                <div>Change Password</div>
                <ChevronRight />
              </div>
            </Link>
            <div className="flex flex-row justify-between p-3 border-b border-[#696969]">
              <div>Notifications</div>
              <ChevronRight />
            </div>
            <div
              className="flex flex-row justify-between p-3 cursor-pointer hover:bg-[#1d1a34]"
              onClick={handleLogout}
            >
              <div>Logout</div>
              <ChevronRight />
            </div>
          </div>
        </div>
        <div className="mt-10">
          <h2 className="uppercase text-lg font-bold">Support</h2>
          <div className="border border-[#696969] my-5 rounded-lg">
            <Link href="/help">
              <div className="flex flex-row justify-between p-3 border-b border-[#696969] hover:bg-[#1d1a34] rounded-t-lg">
                <div>Help</div>
                <ChevronRight />
              </div>
            </Link>
            <div className="flex flex-row justify-between p-3 border-b border-[#696969]">
              <div>Terms</div>
              <ChevronRight />
            </div>
            <div className="flex flex-row justify-between p-3 border-b border-[#696969]">
              <div>Privacy Policy</div>
              <ChevronRight />
            </div>
            <div className="flex flex-row justify-between p-3">
              <div>Acknowledgements</div>
              <ChevronRight />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-7 mb-10 md:gap-2 md:w-[50%] md:m-auto">
        <button className="secondary-button uppercase">Save Changes</button>
        <button className="main-button uppercase">Discard Changes</button>
      </div>
    </div>
  );
}
