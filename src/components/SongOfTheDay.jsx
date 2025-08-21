// components/SongOfTheDay.jsx
import { useEffect, useRef, useState } from "react";

function todaysIndex(length) {
  const now = new Date();
  // Europe/London friendly: use local date so it rolls over with your audience’s day
  const seed = Number(
    `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`
  );
  return length ? seed % length : 0;
}

export default function SongOfTheDay() {
  const containerRef = useRef(null);
  const controllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // load iframe API once
  useEffect(() => {
    if (window.SpotifyIFrameAPI) return;
    const s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const r = await fetch("/tracks.json"); // served by GitHub Pages
        const { uris } = await r.json();
        if (!uris?.length) throw new Error("No tracks found.");

        const uri = uris[todaysIndex(uris.length)];

        const mount = () => {
          if (cancelled) return;
          window.SpotifyIFrameAPI.createController(
            containerRef.current,
            { uri, theme: "dark", width: "100%", height: 152 },
            controller => {
              controllerRef.current = controller;
              setLoading(false);
            }
          );
        };

        if (window.SpotifyIFrameAPI) mount();
        else window.onSpotifyIframeApiReady = mount;
      } catch (e) {
        setError(e.message || "Something went wrong.");
        setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur p-6 shadow-md max-w-xl w-full">
      <h3 className="text-2xl font-bold mb-2">🎵 Song of the Day</h3>
      <p className="text-sm text-gray-600 mb-4">From my playlist, refreshed daily.</p>

      <div ref={containerRef} className="w-full mb-4" />
      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => controllerRef.current?.play()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Play
        </button>
        <button
          onClick={() => controllerRef.current?.pause()}
          className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition"
        >
          Pause
        </button>
      </div>
    </div>
  );
}
