'use client';
import { useState } from 'react';
import ProgressBar from '@/app/ui/progress-bar';
import Link from 'next/link';
import { X } from 'lucide-react';
import { setRegistration, getRegistration } from '../signup/registrationUtils';

const currentStep = 7; // Last step
const totalSteps = 7;

export default function CommunityPage() {
  const [location, setLocation] = useState(getRegistration().location || '');
  const [friends, setFriends] = useState(getRegistration().friends || []);
  const [friendInput, setFriendInput] = useState('');
  const [institution, setInstitution] = useState(
    getRegistration().institution || '',
  );
  const [error, setError] = useState('');

  // Add friend email to list
  const handleAddFriend = () => {
    if (friendInput.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(friendInput)) {
      setFriends([...friends, friendInput.trim()]);
      setFriendInput('');
      setError('');
    } else {
      setError('Please enter a valid email address.');
    }
  };

  // Remove friend email from list
  const handleRemoveFriend = (email) => {
    setFriends(friends.filter((f) => f !== email));
  };

  // Submit community info
  const handleSubmit = (e) => {
    e.preventDefault();
    setRegistration({ location, friends, institution });
    window.location.href = '/login-landing'; // Or next step if needed
  };

  // Skip community info
  const handleSkip = () => {
    window.location.href = '/login-landing';
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between p-3">
      <div>
        <div className="flex flex-row items-center justify-between w-full px-4 py-2">
          <Link href="/login-landing">
            <X size={24} />
          </Link>
          <div className="flex-1 ml-4">
            <ProgressBar progress={currentStep / totalSteps} />
          </div>
        </div>
        <div>
          <p className="text-lg text-center font-bold">
            Introduce your Community
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center w-full gap-4"
          >
            {/* Location input */}
            <input
              type="text"
              placeholder="Suburb or City"
              className="input-field md:w-1/2 top_form_input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required={false}
            />
            {/* Friends input */}
            <input
              type="email"
              placeholder="Enter friend's email"
              className="input-field flex-1"
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
              required={false}
            />
            {/* Academic Institution input */}
            <input
              type="text"
              placeholder="Academic Institution (search or enter manually)"
              className="input-field md:w-1/2 bottom_form_input"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required={false}
            />
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex gap-4 mt-4">
              <button type="submit" className="btn">
                Submit
              </button>
              <button type="button" className="btn" onClick={handleSkip}>
                Skip
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
