"use client";

import { updateFavorit } from "actions/movieActions";
import Link from "next/link";
import { useState } from "react";

export default function MovieCard({ movie }) {
  const [isFavorit, setIsFavorit] = useState(movie.favorit);

  const handleClick = async () => {
    setIsFavorit(!isFavorit);
    await updateFavorit(movie.id, movie.favorit);
  };

  return (
    <div className="col-span-1 relative">
      {isFavorit ? (
        <button
          onClick={handleClick}
          className={`absolute top-2 right-2 z-20 fa-solid fa-heart text-red-500 text-3xl`}
        />
      ) : (
        <button
          onClick={handleClick}
          className={`absolute top-2 right-2 z-20 fa-regular fa-heart text-red-500 text-3xl`}
        />
      )}

      {/* image */}
      <div>
        <img src={movie.image_url} className="w-full" />
        <Link href={`/movies/${movie.id}`}>
          <div className="absolute flex items-center justify-center top-0 bottom-0 left-0 right-0 z-10 bg-black opacity-0 hover:opacity-80 transition-opacity duration-300">
            <p className="text-xl font-bold text-white">{movie.title}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
