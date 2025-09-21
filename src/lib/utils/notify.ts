import { Bounce, toast } from 'react-toastify';

export const notify = (txt: string, type: 'success' | 'error' | 'warn' = 'success') => {
    toast[type](txt, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
    });
}; 