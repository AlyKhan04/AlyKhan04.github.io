//navbar for links to the different pages on my website 
// Navbar with real page navigation + smooth scroll to About on the Home page
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const goToAbout = (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: "about" } });
    } else {
      const el = document.getElementById("about");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,980px)] px-6 py-3 rounded-full bg-white/10 backdrop-blur-md shadow-md">
      <div className="flex items-center justify-between text-white font-medium">
        {/* Left Links */}
        <div className="flex gap-6 text-sm md:text-base">
          <Link to="/" className="hover:text-orange-400 transition">Home</Link>
          <a href="#about" onClick={goToAbout} className="hover:text-orange-400 transition">About</a>
          <Link to="/projects" className="hover:text-orange-400 transition">Projects</Link>
        </div>

        {/* Right placeholder for symmetry */}
        <div className="w-[90px] md:w-[120px]" />
      </div>
    </nav>
  );
}


