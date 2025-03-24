"use client";

import Link from "node_modules/next/link";

export default function Footer() {
  return (
    <footer className="fixed text-center font-bold text-white bottom-0 left-0 right-0 bg-gray-900">
      <p>
        Movie Database Scraped from{" "}
        <Link className="text-blue-600" href="https://www.themoviedb.org/">
          TMDB
        </Link>
      </p>
    </footer>
  );
}
