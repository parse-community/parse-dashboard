import toast from 'react-hot-toast';

export default function notification(type, msg) {
  switch (type) {
    case 'success':
      toast.success(msg);
      return;
    case 'error':
      toast.error(msg);
      return;
    case 'warn':
      toast.warn(msg);
      return;
  }
}
