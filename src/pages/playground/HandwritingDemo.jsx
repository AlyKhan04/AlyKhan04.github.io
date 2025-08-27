import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

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
  const CSS = 280;        // display size
  const TARGET = 28;      // model input size
  const MODEL_URL = `${process.env.PUBLIC_URL}/models/hcr/model.json`;

  const tf = useTf();
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  const [brush, setBrush] = useState(16);
  const [mode, setMode] = useState("draw");
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pred, setPred] = useState("");

  const labels = useMemo(() => Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), []);

  useEffect(() => { document.title = "Handwriting Demo — Aly's Portfolio"; }, []);

  // 280×280 canvas with device-pixel-ratio scaling
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    c.width = Math.round(CSS * dpr);
    c.height = Math.round(CSS * dpr);
    c.style.width = `${CSS}px`;
    c.style.height = `${CSS}px`;
    const ctx = c.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CSS, CSS);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  // Load model
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!tf) return;
      try {
        if (tf.ready) await tf.ready();
        const m = await tf.loadLayersModel(MODEL_URL);
        if (!mounted) return;
        setModel(m);
        setLoadError("");
      } catch (e) {
        console.error("Model load failed:", e);
        if (mounted) setLoadError(String(e?.message || e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [tf]);

  // Drawing
  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - r.left;
    const y = (e.touches?.[0]?.clientY ?? e.clientY) - r.top;
    return { x, y };
  };
  const start = (x, y) => {
    const ctx = canvasRef.current.getContext("2d");
    drawingRef.current = true;
    ctx.strokeStyle = mode === "draw" ? "black" : "white";
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
  const end = () => { drawingRef.current = false; };

  const onDown = (e) => { e.preventDefault(); const { x, y } = getPos(e); start(x, y); };
  const onMove = (e) => { if (!drawingRef.current) return; e.preventDefault(); const { x, y } = getPos(e); move(x, y); };
  const onUp   = (e) => { e?.preventDefault?.(); end(); };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CSS, CSS);
    setPred("");
  };

  // Predict
  const predict = async () => {
    if (!tf || !model) return;
    const src = canvasRef.current;
    const off = document.createElement("canvas");
    off.width = TARGET; off.height = TARGET;
    const octx = off.getContext("2d", { willReadFrequently: true });
    octx.imageSmoothingEnabled = true;
    octx.fillStyle = "white";
    octx.fillRect(0, 0, TARGET, TARGET);
    octx.drawImage(src, 0, 0, src.width, src.height, 0, 0, TARGET, TARGET);

    const { data } = octx.getImageData(0, 0, TARGET, TARGET);
    const gray = new Float32Array(TARGET * TARGET);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      const v = (data[i] + data[i+1] + data[i+2]) / (3 * 255);
      gray[j] = 1 - v;
    }

    const input = tf.tensor4d(gray, [1, TARGET, TARGET, 1]);
    const logits = model.predict(input);
    const probs = logits.softmax ? logits.softmax() : tf.softmax(logits);
    const values = await probs.data();

    input.dispose();
    logits.dispose?.();
    probs.dispose?.();

    const idx = values.indexOf(Math.max(...values));
    setPred(labels[idx] ?? `#${idx}`);
  };

  const ready = !!model && !loading && !loadError;

  return (
    <section className="relative z-10 text-white py-16 px-4 sm:px-8 lg:px-16 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-gray-400">playground</p>
            <h2 className="text-2xl font-semibold">Handwritten Character Recognition</h2>
            <p className="text-gray-400 text-sm mt-1">Draw uppercase letters from A–Z; we convert to 28×28 for the model.</p>
          </div>
          <Link to="/playground" className="text-sm text-orange-400 hover:underline">← All demos</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Canvas card */}
          <div className="min-w-0 p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
            {/* Title + status */}
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">Canvas</h3>
              <span className={`px-2 py-1 rounded text-sm ${ready ? "bg-green-500/30" : loadError ? "bg-red-500/30" : "bg-white/10"}`}>
                Model: {loadError ? "Failed" : loading ? "Loading…" : "Ready"}
              </span>
            </div>

            {/* Controls: stack on mobile, inline from sm+ */}
            <div className="mt-3 flex flex-wrap items-center gap-3 w-full">
              <label className="flex items-center gap-2 w-full sm:w-auto min-w-0">
                Brush
                <input
                  type="range"
                  min="6"
                  max="36"
                  className="w-full sm:w-40 min-w-0"
                  value={brush}
                  onChange={(e) => setBrush(parseInt(e.target.value, 10))}
                />
              </label>

              <label className="flex items-center gap-2 w-full sm:w-auto">
                Mode
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="bg-white/10 rounded px-2 py-1 w-full sm:w-auto"
                >
                  <option value="draw">Draw</option>
                  <option value="erase">Erase</option>
                </select>
              </label>

              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={clearCanvas} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Clear</button>
                <button onClick={predict} disabled={!ready} className="px-3 py-1 rounded bg-orange-500/90 hover:bg-orange-500/100 disabled:opacity-50">
                  Predict
                </button>
              </div>
            </div>

            <div
              className="rounded-lg overflow-hidden border border-white/10 bg-white mx-auto select-none mt-3"
              style={{ width: CSS, height: CSS, touchAction: "none" }}
              onMouseDown={onDown}
              onMouseMove={onMove}
              onMouseUp={onUp}
              onMouseLeave={onUp}
              onTouchStart={onDown}
              onTouchMove={onMove}
              onTouchEnd={onUp}
            >
              <canvas ref={canvasRef} />
            </div>

            {!ready && loadError && (
              <p className="mt-3 text-xs text-red-300 break-all">
                Load error: {loadError}<br />
                Expected at: <code>{MODEL_URL}</code>
              </p>
            )}
          </div>

          {/* Result card */}
          <div className="min-w-0 p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
            <h3 className="font-semibold mb-3">Prediction</h3>
            <div className="text-5xl font-bold tracking-wider">{pred || "—"}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

