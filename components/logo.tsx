"use client";

import Image from "node_modules/next/image";

export default function Logo() {
  return (
    <a href="/" className="flex items-center gap-1">
      <Image
        src="/images/tmdbflix_logo.png"
        alt="TMDBFLIX logo"
        width={50}
        height={30}
        className="!w-20 !h-auto"
      />
    </a>
  );
}
