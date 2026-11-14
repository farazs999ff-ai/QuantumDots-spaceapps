import { useState } from 'react';
import { Atom } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}

export function ResilientImage({ src, alt, caption, className = '' }: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#0a0f1a] border border-slate-800 rounded-xl p-8 text-center ${className}`}
      >
        <Atom className="w-10 h-10 text-sky-400/70 mb-3" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-200">{alt}</p>
        {caption && <p className="text-xs text-slate-400 mt-1">{caption}</p>}
      </div>
    );
  }

  return (
    <figure className={`relative overflow-hidden rounded-xl border border-slate-800 bg-[#070a11] ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover block"
      />
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 py-3 text-xs text-slate-200">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
