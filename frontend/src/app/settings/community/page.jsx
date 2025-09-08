import { useState, useEffect } from 'react';
import {
  getRegistration,
  setRegistration,
} from '../../login-landing/signup/registrationUtils';
import { registerFCMToken } from '../../services/firebase';

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
    <div className="w-full min-h-screen flex flex-col items-center p-6 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">My Community</h2>
      <div className="w-full max-w-xl space-y-6">
        {/* Friends Section */}
        <div className="bg-white border rounded-lg p-4 shadow">
          <h3 className="font-semibold mb-2">Friends</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="email"
              placeholder="Enter friend's email"
              className="input-field flex-1"
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
            />
            <button type="button" className="btn" onClick={handleAddFriend}>
              Add
            </button>
          </div>
          <ul className="mt-2">
            {friends.map((email, idx) => (
              <li key={idx} className="flex items-center gap-2">
                {email}
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => handleRemoveFriend(email)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Institution Section */}
        <div className="bg-white border rounded-lg p-4 shadow">
          <h3 className="font-semibold mb-2">Academic Institution</h3>
          <input
            type="text"
            placeholder="Enter or search for institution"
            className="input-field w-full"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />
        </div>
        {/* Locations Section */}
        <div className="bg-white border rounded-lg p-4 shadow">
          <h3 className="font-semibold mb-2">Locations (up to 3)</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add suburb or city"
              className="input-field flex-1"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
            />
            <button type="button" className="btn" onClick={handleAddLocation}>
              Add
            </button>
          </div>
          <ul className="mt-2">
            {locations.map((loc, idx) => (
              <li key={idx} className="flex items-center gap-2">
                {loc}
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => handleRemoveLocation(loc)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <button type="button" className="btn w-full mt-4" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
