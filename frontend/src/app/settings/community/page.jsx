'use client';
import { useState, useEffect } from 'react';
import {
  getRegistration,
  setRegistration,
} from '../../login-landing/signup/registrationUtils';
import { registerFCMToken } from '../../../services/firebase';

// Color scheme and button classes from login-landing
const cardClass =
  'bg-elo-bg border border-gray-200 rounded-xl shadow-lg p-4 md:p-6 w-full';
const headingClass = 'font-semibold mb-2 text-lg md:text-xl text-elo-primary';
const inputClass =
  'input-field flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-elo-primary text-base md:text-lg';
const btnClass =
  'main-button-landing px-4 py-2 rounded-lg text-white bg-elo-primary hover:bg-elo-primary-dark transition w-full md:w-auto';
const removeBtnClass = 'text-red-500 hover:text-red-700 text-sm md:text-base';
const pageBgClass =
  'min-h-screen flex flex-col items-center justify-center px-4 md:px-10 bg-elo-bg';
const containerClass = 'w-full max-w-xl space-y-6';

export default function CommunitySettingsPage() {
  // Simulate fetching user data (replace with real API calls)
  const [friends, setFriends] = useState([]);
  const [friendInput, setFriendInput] = useState('');
  const [institution, setInstitution] = useState('');
  const [locations, setLocations] = useState([]);
  const [locationInput, setLocationInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch initial data (replace with real API calls)
    const reg = getRegistration();
    setFriends(reg.friends || []);
    setInstitution(reg.institution || '');
    setLocations(reg.locations || []);
  }, []);

  // Add friend
  const handleAddFriend = () => {
    if (friendInput.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(friendInput)) {
      setFriends([...friends, friendInput.trim()]);
      setFriendInput('');
      setError('');
    } else {
      setError('Please enter a valid email address.');
    }
  };

  // Remove friend
  const handleRemoveFriend = (email) => {
    setFriends(friends.filter((f) => f !== email));
  };

  // Add location (max 3)
  const handleAddLocation = () => {
    if (locationInput.trim() && locations.length < 3) {
      setLocations([...locations, locationInput.trim()]);
      setLocationInput('');
      setError('');
    } else if (locations.length >= 3) {
      setError('You can only add up to 3 locations.');
    }
  };

  // Remove location
  const handleRemoveLocation = (loc) => {
    setLocations(locations.filter((l) => l !== loc));
  };

  // Save changes
  const handleSave = () => {
    setRegistration({ friends, institution, locations });
    setError('Saved!');
  };

  return (
    <div className={pageBgClass}>
      <h2 className="logo-text mb-6 text-center text-3xl md:text-4xl">
        My Community
      </h2>
      <div className={containerClass}>
        {/* Friends Section */}
        <div className={cardClass}>
          <h3 className={headingClass}>Friends</h3>
          <div className="flex flex-col md:flex-row gap-2 mb-2 items-center">
            <input
              type="email"
              placeholder="Enter friend's email"
              className={inputClass + ' flex-grow'}
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
            />
            <button
              type="button"
              className={
                btnClass +
                ' px-2 py-1 text-xs md:text-xs w-auto min-w-[40px] md:min-w-[60px] md:px-3 md:py-1'
              }
              onClick={handleAddFriend}
            >
              Add
            </button>
          </div>
          <ul className="mt-2">
            {friends.map((email, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-base md:text-lg"
              >
                {email}
                <button
                  type="button"
                  className={removeBtnClass}
                  onClick={() => handleRemoveFriend(email)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Institution Section */}
        <div className={cardClass}>
          <h3 className={headingClass}>Academic Institution</h3>
          <input
            type="text"
            placeholder="Enter or search for institution"
            className={inputClass + ' w-full'}
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />
        </div>
        {/* Locations Section */}
        <div className={cardClass}>
          <h3 className={headingClass}>Locations (up to 3)</h3>
          <div className="flex flex-col md:flex-row gap-2 mb-2 items-center">
            <input
              type="text"
              placeholder="Add suburb or city"
              className={inputClass + ' flex-grow'}
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
            />
            <button
              type="button"
              className={
                btnClass +
                ' px-2 py-1 text-xs md:text-xs w-auto min-w-[40px] md:min-w-[60px] md:px-3 md:py-1'
              }
              onClick={handleAddLocation}
            >
              Add
            </button>
          </div>
          <ul className="mt-2">
            {locations.map((loc, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-base md:text-lg"
              >
                {loc}
                <button
                  type="button"
                  className={removeBtnClass}
                  onClick={() => handleRemoveLocation(loc)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <button
          type="button"
          className={btnClass + ' mt-4'}
          onClick={handleSave}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
