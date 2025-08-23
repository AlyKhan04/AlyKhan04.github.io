import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { demos } from "./demos";

export default function Playground() {
  useEffect(() => {
    document.title = "Playground — Aly's Portfolio";
  }, []);

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
            <Link
              key={d.slug}
              to={d.path}
              className="group relative p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:border-orange-400/60 transition"
            >
              <h3 className="text-lg font-semibold text-white">{d.title}</h3>
              <p className="mt-1 text-sm text-gray-300">{d.blurb}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {d.tags.map((t) => (
                  <span key={t} className="px-2 py-1 text-xs rounded-md border border-white/10 bg-white/5 text-gray-200">
                    {t}
                  </span>
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
