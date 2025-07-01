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