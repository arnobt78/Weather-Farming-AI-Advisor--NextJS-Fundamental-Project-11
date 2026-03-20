export type UnsplashPhoto = {
  id: string;
  urls: { regular: string; small: string; thumb: string };
  alt_description: string | null;
  user: { name: string; username: string };
};

export type UnsplashSearchResponse = {
  results: UnsplashPhoto[];
  total: number;
};
