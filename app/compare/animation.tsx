import React from 'react';

// Animated glass shine overlay component
export default function GlassShineAnimation() {
  const [shinePos, setShinePos] = React.useState(0);
  React.useEffect(() => {
    let running = true;
    function animate() {
      setShinePos(prev => {
        let next = prev + 0.0025; // much slower
        if (next > 1) {
          next = 0;
        }
        return next;
      });
      if (running) requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
  }, []);
  // The gradient moves left-to-right and right-to-left in a loop
  return (
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background: `linear-gradient(120deg, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0.38) 50%, rgba(255,255,255,0.18) 70%)`,
          opacity: 0.7,
          transform: `translateX(${shinePos * 100 - 20}%) translateY(${shinePos * 40 - 8}%) rotate(-8deg)`,
          filter: 'blur(10px)',
          transition: 'opacity 0.2s',
        }}
      />
    </div>
  );
}
