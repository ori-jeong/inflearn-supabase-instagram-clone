"use client";

import MovieCard from "./movie-card";
import { searchMovies } from "actions/movieActions";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Spinner } from "@material-tailwind/react";
import { useRecoilValue } from "node_modules/recoil";
import { searchState } from "utils/recoil/atoms";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

export default function MovieCardList() {
  // const search = useRecoilValue(searchState);
  // const getAllMoviesQuery = useQuery({
  //   queryKey: ["movie", search],
  //   queryFn: () => searchMovies({ search }),
  // });

  const search = useRecoilValue(searchState);
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      initialPageParam: 1, // 기본 페이지 값
      queryKey: ["movie", search],
      queryFn: ({ pageParam }) =>
        searchMovies({ search, page: pageParam, pageSize: 12 }),
      getNextPageParam: (
        lastPage // 다음 페이지 값
      ) => (lastPage.page ? lastPage.page + 1 : null),
    });

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    //현재 화면 안 && 다음 페이지 존재 && 이미 fetching을 하지 않은 상태 && 어떠한 활동도 하고 있지 않은 상태
    if (inView && hasNextPage && !isFetching && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  // useEffect(() => {
  //   console.log(inView);
  // }, [inView]);

  return (
    <div className="grid gap-1 md:grid-cols-4 grid-cols-3 w-full h-full">
      {/* {getAllMoviesQuery.isLoading && <Spinner />}
      {getAllMoviesQuery.data &&
        getAllMoviesQuery.data.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))} */}
      {(isFetching || isFetchingNextPage) && <Spinner />}
      {
        <>
          {data?.pages
            ?.map((page) => page.data)
            ?.flat()
            ?.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          <div ref={ref}></div>
        </>
      }
    </div>
  );
}
