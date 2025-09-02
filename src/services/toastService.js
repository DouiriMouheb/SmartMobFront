import toast from 'react-hot-toast';

export const showSuccess = (message) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
  });
};

export const showError = (message) => {
  toast.error(message, {
    duration: 6000,
    position: 'top-right',
  });
};

export const showInfo = (message) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: 'ℹ️',
  });
};

export const showLoading = (message) => {
  return toast.loading(message, {
    position: 'top-right',
  });
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
