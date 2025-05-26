import { timestamp } from 'rxjs';

export const handleFormSubmit = (formName, formData = {}) => {
  console.log(`Form "${formName}" submitted with data:`, formData);

  const event = new CustomEvent('formSubmitted', {
    detail: {
      formName,
      formData,
      timestamp: new Date().toISOString(),
    },
  });

  window.dispatchEvent(event);

  return { success: true, formName, formData };
};

export const handleButtonClick = (buttonName) => {
  console.log(`Button "${buttonName}" clicked`);

  const event = new CustomEvent('buttonClicked', {
    detail: {
      buttonName,
      timestamp: new Date().toISOString(),
    },
  });

  window.dispatchEvent(event);

  return { success: true, buttonName };
};
