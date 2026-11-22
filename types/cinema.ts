export interface Movie {
  id: string;
  title: string;
  coverUrl: string;
  bannerUrl: string;
  coverPath: string;
  bannerPath: string;
  description: string;
  duration: number;
  genres: string[];
  rating: number;
  releaseDate: string;
  director?: string;
  cast?: string[];
  language?: string;
  ageRating?: string;
  productionCompany?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface UserCollection {
  id: string;
  name: string;
  normalizedName: string;
  coverUrl: string | null;
  movieCount: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CollectionMovieRelation {
  movieId: string;
  addedAt: string | null;
  movie: Movie | null;
}
