import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const FlickeringGrid = React.memo(({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  width,
  height,
  className,
  maxOpacity = 0.3,
  ...props
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  const memoizedColor = useMemo(() => {
    const toRGBA = (colorStr) => {
      if (typeof window === "undefined") {
        return `rgba(0, 0, 0,`;
      }
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "rgba(255, 0, 0,";
      ctx.fillStyle = colorStr;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      return `rgba(${r}, ${g}, ${b},`;
    };
    return toRGBA(color);
  }, [color]);

  // Keep grid parameters in a ref to avoid triggering re-renders during setup/resize
  const gridParamsRef = useRef(null);

  const setupCanvas = useCallback(
    (canvas, widthVal, heightVal) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = widthVal * dpr;
      canvas.height = heightVal * dpr;
      
      const cols = Math.ceil(widthVal / (squareSize + gridGap));
      const rows = Math.ceil(heightVal / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      gridParamsRef.current = { cols, rows, squares, dpr, w: widthVal, h: heightVal, shouldRedrawAll: true };
    },
    [squareSize, gridGap, maxOpacity]
  );

  // Setup Observers
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const w = width || entry.contentRect.width || container.clientWidth;
      const h = height || entry.contentRect.height || container.clientHeight;
      
      setupCanvas(canvas, w, h);
    });
    resizeObserver.observe(container);

    let intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [setupCanvas, width, height]);

  // Animation Loop
  useEffect(() => {
    if (!isInView) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = null;
    let lastTime = performance.now();

    const animate = (time) => {
      const gridParams = gridParamsRef.current;
      if (!gridParams) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      const { cols, rows, squares, dpr, shouldRedrawAll } = gridParams;
      const step = (squareSize + gridGap) * dpr;
      const size = squareSize * dpr;

      if (shouldRedrawAll) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const opacity = squares[i * rows + j];
            if (opacity > 0) {
              ctx.fillStyle = `${memoizedColor}${opacity})`;
              ctx.fillRect(i * step, j * step, size, size);
            }
          }
        }
        gridParams.shouldRedrawAll = false;
      } else {
        // Only update and redraw changed cells to optimize CPU performance
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            if (Math.random() < flickerChance * deltaTime) {
              const idx = i * rows + j;
              const oldOpacity = squares[idx];
              const newOpacity = Math.random() * maxOpacity;
              
              if (oldOpacity !== newOpacity) {
                squares[idx] = newOpacity;
                ctx.clearRect(i * step, j * step, size, size);
                if (newOpacity > 0) {
                  ctx.fillStyle = `${memoizedColor}${newOpacity})`;
                  ctx.fillRect(i * step, j * step, size, size);
                }
              }
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isInView, squareSize, gridGap, flickerChance, maxOpacity, memoizedColor]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${className || ""}`}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full"
      />
    </div>
  );
});

FlickeringGrid.displayName = "FlickeringGrid";

export { FlickeringGrid };
