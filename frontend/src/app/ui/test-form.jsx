import { useState } from 'react';
import { handleFormSubmit, handleButtonClick } from '../../utils/formUtils';

export default function TestForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    message: '',
  });

  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Use the utility function for testing
    const result = handleFormSubmit('testForm', formData);

    if (result.success) {
      setSubmitStatus('Form submitted successfully!');
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({ username: '', email: '', message: '' });
        setSubmitStatus('');
      }, 2000);
    }
  };

  const handleResetClick = () => {
    handleButtonClick('resetButton');
    setFormData({ username: '', email: '', message: '' });
    setSubmitStatus('Form reset');
    setTimeout(() => setSubmitStatus(''), 1500);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Test Form</h2>

      {submitStatus && (
        <div
          className={`mb-4 p-3 rounded ${
            submitStatus.includes('success')
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}
          data-testid="status-message"
        >
          {submitStatus}
        </div>
      )}

      <form onSubmit={onSubmit} data-testid="test-form">
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="username-input"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="email-input"
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="message-input"
            placeholder="Enter your message here..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="submit-button"
          >
            Submit
          </button>

          <button
            type="button"
            onClick={handleResetClick}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            data-testid="reset-button"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
