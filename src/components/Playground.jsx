import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Playground.jsx
 *
 * A simple Playground page + a Handwriting demo using TensorFlow.js.
 * - Pure client-side: works on GitHub Pages (no backend).
 * - TFJS is lazy-loaded from a CDN to keep your main bundle small.
 * - The model is expected at: public/models/hcr/model.json (+ weight shards)
 *
 * HOW TO USE
 * 1) Export/convert your Keras model to TFJS format:
 *    tensorflowjs_converter --input_format=keras path/to/model.keras public/models/hcr
 *    (or .h5 → same command with the .h5 path)
 * 2) Ensure files are committed: public/models/hcr/model.json and group*.bin
 * 3) Add routes in App.js (BrowserRouter):
 *    import Playground, { HandwritingDemo } from "./pages/Playground";
 *    <Route path="/playground" element={<Playground />} />
 *    <Route path="/playground/handwriting" element={<HandwritingDemo />} />
 * 4) Add a link in Navbar: <Link to="/playground">Playground</Link>
 */

// --- Small helper to lazy‑load TensorFlow.js from a CDN ---
function useTf() {
  const [tf, setTf] = useState(() => (typeof window !== "undefined" ? window.tf : undefined));

  useEffect(() => {
    if (tf) return; // already present
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js";
    script.async = true;
    script.onload = () => setTf(window.tf);
    script.onerror = () => console.error("Failed to load TensorFlow.js");
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [tf]);

  return tf;
}

// --- Handwriting Recognition Demo ---
export function HandwritingDemo() {
  const tf = useTf();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pred, setPred] = useState(null);
  const [topk, setTopk] = useState([]);
  const [brush, setBrush] = useState(16);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  const labels = useMemo(() => Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), []); // A..Z
  const modelUrl = useMemo(() => `${process.env.PUBLIC_URL}/models/hcr/model.json`, []);

  // Fit canvas to device pixel ratio for crisp strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssSize = 320; // CSS pixels
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;
    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    // White background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, cssSize, cssSize);
  }, []);

  // Load model once TFJS is ready
  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!tf) return;
      try {
        const m = await tf.loadLayersModel(modelUrl);
        if (!isMounted) return;
        setModel(m);
      } catch (e) {
        console.error("Failed to load model:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [tf, modelUrl]);

  // Drawing handlers (mouse + touch)
  const start = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawingRef.current = true;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineWidth = brush;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const move = (x, y) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const end = () => {
    drawingRef.current = false;
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    const { x, y } = getPos(e);
    start(x, y);
  };
  const onPointerMove = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    move(x, y);
  };
  const onPointerUp = (e) => {
    e.preventDefault();
    end();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const predict = async () => {
    if (!tf || !model) return;
    const canvas = canvasRef.current;
    const size = 28; // expected by most A-Z models (adjust if yours differs)
    // Downscale to NxN on an offscreen canvas
    const off = document.createElement("canvas");
    off.width = size;
    off.height = size;
    const offCtx = off.getContext("2d", { willReadFrequently: true });
    // Draw with white bg then source canvas centered
    offCtx.fillStyle = "white";
    offCtx.fillRect(0, 0, size, size);
    offCtx.drawImage(canvas, 0, 0, size, size);

    const { data } = offCtx.getImageData(0, 0, size, size);
    // Convert RGBA → grayscale [0,1], invert so black ink → high value
    const gray = new Float32Array(size * size);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const v = (r + g + b) / (3 * 255); // 0..1 where 1 is white
      gray[j] = 1 - v; // invert (ink → 1)
    }

    const input = tf.tensor4d(gray, [1, size, size, 1]);
    const logits = model.predict(input);
    const probs = logits.softmax ? logits.softmax() : tf.softmax(logits);
    const values = await probs.data();
    input.dispose();
    if (logits.dispose) logits.dispose();
    if (probs.dispose) probs.dispose();

    // Top-3
    const idxs = Array.from(values.keys());
    idxs.sort((a, b) => values[b] - values[a]);
    const top = idxs.slice(0, 3).map((i) => ({ label: labels[i] ?? `#${i}` , p: values[i] }));

    setPred(top[0]);
    setTopk(top);
  };

  return (
    <section className="relative z-10 text-white py-16 px-4 sm:px-8 lg:px-16 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-gray-400">playground</p>
            <h2 className="text-2xl font-semibold">Handwritten Character Recognition</h2>
            <p className="text-gray-400 text-sm mt-1">Draw an uppercase A–Z letter. Model loads in your browser.</p>
          </div>
          <Link to="/playground" className="text-sm text-orange-400 hover:underline">← All demos</Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Canvas card */}
          <div className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Canvas</h3>
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2">
                  Brush
                  <input
                    type="range"
                    min="6"
                    max="36"
                    value={brush}
                    onChange={(e) => setBrush(parseInt(e.target.value, 10))}
                  />
                </label>
                <button onClick={clearCanvas} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Clear</button>
                <button onClick={predict} disabled={loading} className="px-3 py-1 rounded bg-orange-500/90 hover:bg-orange-500/100 disabled:opacity-50">
                  {loading ? "Loading model…" : "Predict"}
                </button>
              </div>
            </div>

            <div
              className="rounded-lg overflow-hidden border border-white/10 bg-white"
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              onTouchEnd={onPointerUp}
            >
              <canvas ref={canvasRef} className="block" />
            </div>
          </div>

          {/* Results card */}
          <div className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
            <h3 className="font-semibold mb-3">Prediction</h3>
            {pred ? (
              <div>
                <div className="text-2xl font-semibold">{pred.label}</div>
                <div className="mt-2 text-sm text-gray-300">Top guesses</div>
                <ul className="mt-2 space-y-2">
                  {topk.map((t) => (
                    <li key={t.label} className="flex items-center justify-between text-gray-200">
                      <span>{t.label}</span>
                      <span className="text-gray-400">{(t.p * 100).toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-400">Draw a letter and hit Predict.</p>
            )}

            <div className="mt-6 text-xs text-gray-400">
              <p>Tip: If your model expects a different input size (e.g., 32×32), change the <code>size</code> constant.</p>
              <p>Model path: <code>public/models/hcr/model.json</code></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Playground landing page ---
export default function Playground() {
  const demos = [
    {
      title: "Handwritten Character Recognition",
      to: "/playground/handwriting",
      blurb: "Draw a letter A–Z and see the model predict it in real time.",
      tags: ["TensorFlow.js", "Canvas", "A–Z"],
    },
  ];

  return (
    <section className="relative z-10 text-white py-16 px-4 sm:px-8 lg:px-16 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase text-gray-400">experiments</p>
          <h2 className="text-2xl font-semibold">Playground</h2>
          <p className="text-gray-400 text-sm mt-1">Interactive demos and prototypes.</p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {demos.map((d) => (
            <Link key={d.to} to={d.to} className="group p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:border-orange-400/60 transition">
              <h3 className="text-lg font-semibold text-white">{d.title}</h3>
              <p className="mt-1 text-sm text-gray-300">{d.blurb}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {d.tags.map((t) => (
                  <span key={t} className="px-2 py-1 text-xs rounded-md border border-white/10 bg-white/5 text-gray-200">{t}</span>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                <div className="absolute -inset-16 bg-gradient-to-tr from-orange-400/10 via-transparent to-transparent blur-3xl" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
