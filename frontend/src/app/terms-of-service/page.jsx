'use client';
import Back from '@/app/ui/back';

export default function Page() {
  return (
    <div className="min-h-screen">
      <div>
        <Back pagename="Terms of Service" />
      </div>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-6">Terms of Service</h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using ELO Learning, you agree to be bound by
              these Terms of Service and all applicable laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You must provide accurate information when creating an account
              </li>
              <li>
                You are responsible for maintaining the security of your account
              </li>
              <li>You must not share your account credentials</li>
              <li>You must be at least 5 years old to use the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the service for any illegal purpose</li>
              <li>
                Attempt to gain unauthorized access to any part of the service
              </li>
              <li>Interfere with other users&#39; experience</li>
              <li>Engage in any form of cheating or gaming manipulation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              4. Intellectual Property
            </h2>
            <p>
              All content and materials available on ELO Learning are owned by
              or licensed to us and are protected by copyright and other
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              5. Service Modifications
            </h2>
            <p>
              We reserve the right to modify or discontinue the service at any
              time, with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Contact</h2>
            <p>
              For any questions regarding these Terms of Service, please contact
              us at: zeroday0d4y@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
