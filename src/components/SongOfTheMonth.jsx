import { useEffect, useRef, useState } from "react";

const base = process.env.PUBLIC_URL || ""; // works locally & on GitHub Pages

function fmt(t) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function SongOfTheMonth() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(NaN);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onLoaded = () => setDur(a.duration);
    const onTime = () => setTime(a.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
  };

  const seek = (e) => {
    const a = audioRef.current;
    if (!a || !isFinite(dur)) return;
    const v = Number(e.target.value);
    a.currentTime = (v / 1000) * dur;
  };

  const srcMp3 = `${base}/audio/song-of-the-month.mp3`;
  const srcOgg = `${base}/audio/song-of-the-month.ogg`;

  return (
    <>
      <h3 className="text-xl font-semibold mb-2">🎵 Song of the Month</h3>
      <p className="text-sm text-gray-400 mb-4">A song I can't stop playing in the background</p>

      <audio ref={audioRef} preload="metadata">
        <source src={srcOgg} type="audio/ogg" />
        <source src={srcMp3} type="audio/mpeg" />
      </audio>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className={`px-4 py-2 rounded transition ${
            isPlaying
              ? "border border-blue-600 text-blue-600 hover:bg-blue-50"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="1000"
            step="1"
            value={isFinite(dur) && dur > 0 ? Math.round((time / dur) * 1000) : 0}
            onChange={seek}
            className="w-full"
            aria-label="Seek"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{fmt(time)}</span>
            <span>{isFinite(dur) ? fmt(dur) : "0:00"}</span>
          </div>
        </div>
      </div>
    </>
  );
}
