import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Starfield from "./components/Starfield";
import Home from "./pages/home";              // ⬅️ new page (see below)
import Projects from "./components/Projects"; // already created
import "./App.css";

export default function App() {
  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
      <Starfield />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </Router>
    </div>
  );
}
