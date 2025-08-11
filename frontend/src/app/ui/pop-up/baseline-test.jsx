import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function BaselineTestPopup({ onClose, userId }) {
  const router = useRouter();

  const handleNo = async () => {
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
      { baseLineTest: true },
      { withCredentials: true }
    );
    onClose(); // stay on dashboard
  };

  const handleYes = () => {
    router.push('/baseline');
  };

  return (
    <div className="popup">
      <h2>Would you like to take your baseline test now?</h2>
      <div className="flex gap-4">
        <button onClick={handleYes} className="main-button">Yes</button>
        <button onClick={handleNo} className="secondary-button">No</button>
      </div>
    </div>
  );
}
