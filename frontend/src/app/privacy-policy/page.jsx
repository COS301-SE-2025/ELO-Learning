'use client';
import Back from '@/app/ui/back';

export default function Page() {
  return (
    <div className="min-h-screen">
      <div>
        <Back pagename="Privacy Policy" />
      </div>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-6">Privacy Policy</h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-3">
              1. Information We Collect
            </h2>
            <p className="mb-2">We collect the following information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name and email address</li>
              <li>Age and grade level</li>
              <li>Username</li>
              <li>Game performance and progress data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              2. How We Use Your Information
            </h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create and manage your account</li>
              <li>Track your progress and performance</li>
              <li>Provide personalized learning experiences</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Data Protection</h2>
            <p>
              We implement security measures to protect your personal
              information. Your data is stored securely and is not shared with
              third parties without your consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access your personal data</li>
              <li>Request data correction</li>
              <li>Request data deletion</li>
              <li>Withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Contact Us</h2>
            <p>
              If you have any questions about our privacy policy, please contact
              us at: zeroday0d4y@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
