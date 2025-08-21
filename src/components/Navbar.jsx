//navbar for links to the different pages on my website 
export default function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-5xl z-50 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md shadow-md">
      <div className="flex items-center justify-between text-white font-medium">
        {/* Left Links */}
        <div className="flex gap-6 text-sm md:text-base">
          <a href="#home" className="hover:text-orange-400 transition">Home</a>
          <a href="#about" className="hover:text-orange-400 transition">About</a>
          <a href="#projects" className="hover:text-orange-400 transition">Projects</a>
        </div>

        {/* Center Logo */}
        <div className="text-lg md:text-xl font-bold tracking-wide">
          aly.dev
        </div>

        {/* Right placeholder for symmetry */}
        <div className="w-[90px] md:w-[120px]"></div>
      </div>
    </nav>
  );
}

