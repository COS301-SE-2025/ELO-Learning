// Type definitions
interface FormData {
  [key: string]: any;
}

interface FormSubmitResponse {
  success: boolean;
  formName: string;
  formData: FormData;
}

interface ButtonClickResponse {
  success: boolean;
  buttonName: string;
}

interface FormSubmittedEventDetail {
  formName: string;
  formData: FormData;
  timestamp: string;
}

interface ButtonClickedEventDetail {
  buttonName: string;
  timestamp: string;
}

// Extend the Window interface to include our custom events
declare global {
  interface WindowEventMap {
    formSubmitted: CustomEvent<FormSubmittedEventDetail>;
    buttonClicked: CustomEvent<ButtonClickedEventDetail>;
  }
}

export const handleFormSubmit = (
  formName: string,
  formData: FormData = {},
): FormSubmitResponse => {
  const event = new CustomEvent<FormSubmittedEventDetail>('formSubmitted', {
    detail: {
      formName,
      formData,
      timestamp: new Date().toISOString(),
    },
  });

  window.dispatchEvent(event);

  return { success: true, formName, formData };
};

export const handleButtonClick = (buttonName: string): ButtonClickResponse => {
  const event = new CustomEvent<ButtonClickedEventDetail>('buttonClicked', {
    detail: {
      buttonName,
      timestamp: new Date().toISOString(),
    },
  });

  window.dispatchEvent(event);

  return { success: true, buttonName };
};
