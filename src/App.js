import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Starfield from "./components/Starfield";
import Home from "./pages/Home";

const Playground = lazy(() => import("./pages/playground")); // index.jsx default export
const HandwritingDemo = lazy(() => import("./pages/playground/HandwritingDemo"));

export default function App() {
  return (
    <div className="relative bg-black min-h-screen overflow-hidden">
      <Starfield />
      <Router>
        <Navbar />
        <Suspense fallback={<div className="text-white p-6">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<(await import('./components/Projects')).default />} /> {/* optional lazy too */}
            <Route path="/playground" element={<Playground />} />
            <Route path="/playground/handwriting" element={<HandwritingDemo />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}
