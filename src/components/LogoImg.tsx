"use client";

import { useState } from "react";

/** Company logo that quietly falls back to the first letter if the image fails to load. */
export function LogoImg({ src, letter, size }: { src: string; letter: string; size: number }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <span className="font-bold text-navy" style={{ fontSize: size * 0.4 }}>{letter}</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" onError={() => setOk(false)} className="object-contain" style={{ width: size * 0.62, height: size * 0.62 }} loading="lazy" />;
}
