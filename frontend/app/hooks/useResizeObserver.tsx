import { useEffect, useRef, useState } from "react";

const useResizeObserver = <T extends Element>() => {
  const containerRef = useRef<T>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const setSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setWidth(width);
        setHeight(height);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      setSize();
    });

    if (containerRef.current) {
      setSize();
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { containerRef, width, height };
};

export default useResizeObserver;
