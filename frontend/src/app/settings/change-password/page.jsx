'use client';
import Back from '@/app/ui/back';
import { changePassword } from '@/services/api';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function validatePassword(password) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
    password,
  );
}

export default function Page() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        'New password must be at least 8 characters, include an uppercase letter, a number, and a special character.',
      );
      return;
    }

    setError('');
    setLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      // Redirect to settings after 2 seconds
      setTimeout(() => {
        router.push('/settings');
      }, 2000);
    } catch (err) {
      setError(
        err?.response?.data?.error || 'Failed to change password. Try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="whitespace-nowrap">
        <Back pagename="Change Password" />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div className="my-4">
          {success ? (
            <div className="flex flex-col items-center w-full px-4 md:px-0">
              <p className="text-center text-green-600 mt-4 w-[90vw] md:w-[500px]">
                Password successfully changed! Redirecting...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col items-center w-full px-4 md:px-0">
                <div className="relative w-[90vw] md:w-[500px]">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Current password"
                    className="input-field w-full top_form_input pr-14"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                <div className="relative w-[90vw] md:w-[500px]">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="New password "
                    className="input-field w-full middle_form_input pr-14"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="relative w-[90vw] md:w-[500px]">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    className="input-field w-full bottom_form_input pr-14 border-t-[1px]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-red-500 mt-2 w-[90vw] md:w-[500px] text-center">
                    {error}
                  </p>
                )}
                <div className="break_small"></div>
                <button
                  className="main-button px-2 py-8"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
