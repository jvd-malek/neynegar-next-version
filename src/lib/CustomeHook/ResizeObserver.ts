import { useEffect, useState } from 'react';

const useResizeObserver = (ref: any) => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;
            setWidth(width);
        });

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [ref]);

    return width;
};

export default useResizeObserver;