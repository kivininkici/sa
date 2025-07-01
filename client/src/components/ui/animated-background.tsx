import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 4)]
    });

    const initParticles = () => {
      particlesRef.current = Array.from({ length: 80 }, createParticle);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });

      // Draw connections
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (100 - distance) / 100 * 0.2;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-30"
      style={{ zIndex: -1 }}
    />
  );
}

export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      {/* Large floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl floating-orb morph-shape" />
      <div className="absolute top-3/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-400/15 to-blue-600/15 blur-2xl floating-orb morph-shape" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-3/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-600/20 blur-3xl floating-orb morph-shape" style={{ animationDelay: '4s' }} />
      
      {/* Medium floating particles */}
      <div className="absolute top-1/3 right-1/3 w-32 h-32 rounded-full bg-gradient-to-br from-green-400/25 to-blue-500/25 blur-xl floating-orb" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400/30 to-purple-500/30 blur-lg floating-orb" style={{ animationDelay: '3s' }} />
      
      {/* Small accent lights */}
      <div className="absolute top-1/6 right-1/6 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400/40 to-orange-500/40 blur-md floating-orb" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/3 right-2/3 w-20 h-20 rounded-full bg-gradient-to-br from-pink-400/35 to-red-500/35 blur-lg floating-orb" style={{ animationDelay: '2.5s' }} />
    </div>
  );
}