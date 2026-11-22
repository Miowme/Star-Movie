import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Film,
  FolderHeart,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getVerifiedSession } from "@/lib/auth/session";
import { getPaginatedMovies } from "@/services/movie.service";
import type { Movie } from "@/types/cinema";
import Image from "next/image";

async function HomeContent() {
  const session = await getVerifiedSession();

  let featuredMovies: Movie[] = [];
  try {
    const { movies } = await getPaginatedMovies(null);
    featuredMovies = movies.slice(0, 5);
  } catch {
    featuredMovies = [];
  }

  const spotlightMovie = featuredMovies[0] ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-[#12151B] text-[#F4F5F7]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#292E37] bg-[#1B2027]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#6F1BA5]/40 bg-[#6F1BA5]/20">
              <Film className="h-5 w-5 text-[#E5C51A]" />
            </div>
            <span className="text-xl font-bold tracking-wider text-[#F4F5F7]">
              STAR <span className="text-[#E5C51A]">CINEMA</span>
            </span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4">
            {session ? (
              <>
                <Link
                  href="/movies"
                  className="hidden text-sm text-[#858B96] transition-colors hover:text-[#F4F5F7] sm:inline-block"
                >
                  Movies
                </Link>
                <Link
                  href="/collections"
                  className="hidden text-sm text-[#858B96] transition-colors hover:text-[#F4F5F7] sm:inline-block"
                >
                  My Collections
                </Link>
                {session.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="hidden items-center gap-1 text-sm font-medium text-[#E5C51A] hover:underline md:inline-flex"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link href="/movies">
                  <Button className="bg-[#6F1BA5] text-sm font-semibold text-[#F4F5F7] hover:bg-[#8B2FC1]">
                    Browse Catalog
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-sm text-[#F4F5F7] hover:bg-[#12151B] hover:text-[#E5C51A]"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-[#6F1BA5] text-sm font-semibold text-[#F4F5F7] hover:bg-[#8B2FC1]">
                    Join Free
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-[#292E37]">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-12 md:py-20">
            {/* Hero Copy */}
            <div className="space-y-6 md:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#6F1BA5]/40 bg-[#1B2027] px-3.5 py-1.5 text-xs font-medium text-[#F4F5F7]">
                <Sparkles className="h-3.5 w-3.5 text-[#E5C51A]" />
                <span>Premium Cinema Experience & Personal Watchlists</span>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#F4F5F7] sm:text-5xl">
                Discover Cinema. <span className="text-[#E5C51A]">Curate</span>{" "}
                Your Ultimate Movie Lists.
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-[#858B96] sm:text-lg">
                Explore the latest theatrical releases at{" "}
                <span className="font-semibold text-[#F4F5F7]">
                  STAR Cinema
                </span>
                , dive into rich film details, and organize your must-watch
                titles into personalized collections.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {session ? (
                  <>
                    <Link href="/movies">
                      <Button className="h-11 bg-[#6F1BA5] px-6 text-sm font-semibold text-[#F4F5F7] hover:bg-[#8B2FC1]">
                        <Play className="mr-2 h-4 w-4 fill-current" />
                        Explore Movies
                      </Button>
                    </Link>
                    <Link href="/collections">
                      <Button
                        variant="outline"
                        className="h-11 border-[#292E37] bg-[#1B2027] px-6 text-sm font-semibold text-[#F4F5F7] hover:border-[#6F1BA5] hover:bg-[#1B2027]"
                      >
                        <FolderHeart className="mr-2 h-4 w-4 text-[#E5C51A]" />
                        My Collections
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/register">
                      <Button className="h-11 bg-[#6F1BA5] px-6 text-sm font-semibold text-[#F4F5F7] hover:bg-[#8B2FC1]">
                        Create Free Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="h-11 border-[#292E37] bg-[#1B2027] px-6 text-sm font-semibold text-[#F4F5F7] hover:border-[#6F1BA5] hover:bg-[#1B2027]"
                      >
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Hero Spotlight Card */}
            <div className="md:col-span-5">
              {spotlightMovie ? (
                <Link
                  href={session ? `/movies/${spotlightMovie.id}` : "/login"}
                  className="group block overflow-hidden rounded-xl border border-[#292E37] bg-[#1B2027] transition-colors hover:border-[#6F1BA5]"
                >
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-[#12151B]">
                    {spotlightMovie.bannerUrl || spotlightMovie.coverUrl ? (
                      <Image
                        src={
                          spotlightMovie.bannerUrl || spotlightMovie.coverUrl
                        }
                        alt={spotlightMovie.title}
                        width={800}
                        height={500}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#858B96]">
                        <Film className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-md border border-[#292E37] bg-[#12151B]/90 px-2.5 py-1 text-xs font-semibold text-[#E5C51A]">
                      Featured Release
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="line-clamp-1 text-lg font-bold text-[#F4F5F7] group-hover:text-[#E5C51A]">
                        {spotlightMovie.title}
                      </h2>
                      <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#E5C51A]">
                        <Star className="h-4 w-4 fill-[#E5C51A]" />
                        {spotlightMovie.rating.toFixed(1)}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#858B96]">
                      {spotlightMovie.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {spotlightMovie.genres.slice(0, 3).map((genre) => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="border border-[#292E37] bg-[#12151B] text-[11px] font-normal text-[#F4F5F7]"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-xl border border-[#292E37] bg-[#1B2027] p-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-[#6F1BA5]/40 bg-[#6F1BA5]/20">
                    <Film className="h-6 w-6 text-[#E5C51A]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#F4F5F7]">
                    STAR Cinema Catalog
                  </h2>
                  <p className="mt-1.5 text-sm text-[#858B96]">
                    Sign in to browse the full movie lineup and build custom
                    collections.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Now Showing Preview Section */}
        <section className="border-b border-[#292E37] py-14">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#F4F5F7]">
                  Now Showing
                </h2>
                <p className="mt-1 text-sm text-[#858B96]">
                  Latest titles currently featured in our catalog
                </p>
              </div>

              <Link
                href={session ? "/movies" : "/login"}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#E5C51A] hover:underline"
              >
                View All Movies
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {featuredMovies.length === 0 ? (
              <div className="rounded-xl border border-[#292E37] bg-[#1B2027] p-10 text-center">
                <Film className="mx-auto mb-2.5 h-8 w-8 text-[#858B96]" />
                <p className="text-sm text-[#858B96]">
                  No movies are currently listed. Check back soon for upcoming
                  releases.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {featuredMovies.map((movie) => {
                  const releaseYear = movie.releaseDate
                    ? new Date(movie.releaseDate).getFullYear()
                    : null;

                  return (
                    <Link
                      key={movie.id}
                      href={session ? `/movies/${movie.id}` : "/login"}
                      className="group flex flex-col overflow-hidden rounded-xl border border-[#292E37] bg-[#1B2027] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#6F1BA5]"
                    >
                      <div className="aspect-2/3 w-full overflow-hidden bg-[#12151B]">
                        {movie.coverUrl ? (
                          <Image
                            src={movie.coverUrl}
                            alt={movie.title}
                            width={400}
                            height={600}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#858B96]">
                            <Film className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-3">
                        <h3 className="line-clamp-2 text-sm font-semibold text-[#F4F5F7] group-hover:text-[#E5C51A]">
                          {movie.title}
                        </h3>

                        <div className="mt-2.5 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 font-semibold text-[#E5C51A]">
                            <Star className="h-3.5 w-3.5 fill-[#E5C51A]" />
                            {movie.rating.toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1 text-[#858B96]">
                            {releaseYear && !Number.isNaN(releaseYear) ? (
                              releaseYear
                            ) : (
                              <>
                                <Clock className="h-3 w-3" />
                                {movie.duration}m
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Platform Features */}
        <section className="py-14">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#292E37] bg-[#1B2027] p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[#6F1BA5]/40 bg-[#6F1BA5]/20">
                <Film className="h-5 w-5 text-[#E5C51A]" />
              </div>
              <h3 className="text-base font-bold text-[#F4F5F7]">
                Curated Movie Catalog
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#858B96]">
                Browse complete details including ratings, runtime, genres,
                directors, and cast members.
              </p>
            </div>

            <div className="rounded-xl border border-[#292E37] bg-[#1B2027] p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[#6F1BA5]/40 bg-[#6F1BA5]/20">
                <FolderHeart className="h-5 w-5 text-[#E5C51A]" />
              </div>
              <h3 className="text-base font-bold text-[#F4F5F7]">
                Custom Collections
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#858B96]">
                Create private movie collections and bulk-add titles in a single
                click to plan your watchlists.
              </p>
            </div>

            <div className="rounded-xl border border-[#292E37] bg-[#1B2027] p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[#6F1BA5]/40 bg-[#6F1BA5]/20">
                <ShieldCheck className="h-5 w-5 text-[#E5C51A]" />
              </div>
              <h3 className="text-base font-bold text-[#F4F5F7]">
                Secure Member Access
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#858B96]">
                Protected accounts powered by Firebase Authentication so your
                collections stay private and synced.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#292E37] bg-[#1B2027] py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-[#858B96] sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-[#F4F5F7]">
            <Film className="h-4 w-4 text-[#E5C51A]" />
            <span>STAR CINEMA</span>
          </div>
          <p>© {new Date().getFullYear()} STAR Cinema. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#12151B] text-sm text-[#858B96]">
          Loading STAR Cinema...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
