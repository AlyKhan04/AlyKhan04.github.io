import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Lazy-load TensorFlow.js from CDN so it doesn't bloat your main bundle
function useTf() {
  const [tf, setTf] = useState(() => (typeof window !== "undefined" ? window.tf : undefined));
  useEffect(() => {
    if (tf) return;
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js";
    s.async = true;
    s.onload = () => setTf(window.tf);
    s.onerror = () => console.error("Failed to load TensorFlow.js");
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, [tf]);
  return tf;
}

export default function HandwritingDemo() {
  useEffect(() => {
    document.title = "Handwriting Demo — Aly's Portfolio";
  }, []);

  const tf = useTf();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pred, setPred] = useState(null);
  const [topk, setTopk] = useState([]);
  const [brush, setBrush] = useState(16);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  const labels = useMemo(
    () => Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
    []
  );
  const modelUrl = useMemo(() => `${process.env.PUBLIC_URL}/models/hcr/model.json`, []);

  // Fit canvas to device pixel ratio
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssSize = 320;
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;
    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, cssSize, cssSize);
  }, []);

  // Load model
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!tf) return;
      try {
        const m = await tf.loadLayersModel(modelUrl);
        if (mounted) setModel(m);
      } catch (e) {
        console.error("Failed to load model:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [tf, modelUrl]);

  // Drawing helpers
  const start = (x, y) => {
    const ctx = canvasRef.current.getContext("2d");
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
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const end = () => (drawingRef.current = false);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e) => { e.preventDefault(); const { x, y } = getPos(e); start(x, y); };
  const onPointerMove = (e) => { if (!drawingRef.current) return; e.preventDefault(); const { x, y } = getPos(e); move(x, y); };
  const onPointerUp = (e) => { e.preventDefault(); end(); };

  const clearCanvas = () => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);
    setPred(null);
    setTopk([]);
  };

  const predict = async () => {
    if (!tf || !model) return;
    const size = 28; // your model's input size
    const off = document.createElement("canvas");
    off.width = size; off.height = size;
    const offCtx = off.getContext("2d", { willReadFrequently: true });
    offCtx.fillStyle = "white";
    offCtx.fillRect(0, 0, size, size);
    offCtx.drawImage(canvasRef.current, 0, 0, size, size);
    const { data } = offCtx.getImageData(0, 0, size, size);

    // RGBA -> grayscale [0..1], invert (black ink => 1)
    const gray = new Float32Array(size * size);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      const v = (data[i] + data[i+1] + data[i+2]) / (3 * 255);
      gray[j] = 1 - v;
    }

    const input = tf.tensor4d(gray, [1, size, size, 1]);
    const logits = model.predict(input);
    const probs = logits.softmax ? logits.softmax() : tf.softmax(logits);
    const values = await probs.data();
    input.dispose();
    if (logits.dispose) logits.dispose();
    if (probs.dispose) probs.dispose();

    const idxs = Array.from(values.keys()).sort((a, b) => values[b] - values[a]);
    const top = idxs.slice(0, 3).map(i => ({ label: labels[i] ?? `#${i}`, p: values[i] }));
    setPred(top[0]); setTopk(top);
  };

  return (
    <section className="relative z-10 text-white py-16 px-4 sm:px-8 lg:px-16 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-gray-400">playground</p>
            <h2 className="text-2xl font-semibold">Handwritten Character Recognition</h2>
            <p className="text-gray-400 text-sm mt-1">Draw an uppercase A–Z letter. Model runs in your browser.</p>
          </div>
          <Link to="/playground" className="text-sm text-orange-400 hover:underline">← All demos</Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Canvas</h3>
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2">
                  Brush
                  <input type="range" min="6" max="36" value={brush} onChange={(e) => setBrush(parseInt(e.target.value, 10))} />
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

          <div className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
            <h3 className="font-semibold mb-3">Prediction</h3>
            {pred ? (
              <>
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
              </>
            ) : (
              <p className="text-gray-400">Draw a letter and hit Predict.</p>
            )}
            <div className="mt-6 text-xs text-gray-400">
              <p>Model path: <code>public/models/hcr/model.json</code> — input size: <code>28×28</code>, grayscale.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
