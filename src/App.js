import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Starfield from "./components/Starfield";
import './App.css';

function App() {
  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
      <Starfield />
      <Navbar />
      <Hero />
    </div>
  );
}

export default App;
