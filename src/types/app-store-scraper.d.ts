declare module "app-store-scraper" {
  const store: {
    search: (opts: {
      term: string;
      num?: number;
      page?: number;
      country?: string;
      lang?: string;
    }) => Promise<Record<string, unknown>[]>;
    reviews: (opts: {
      id?: number;
      appId?: string;
      sort?: number;
      page?: number;
      country?: string;
    }) => Promise<Record<string, unknown>[]>;
    app: (opts: { id?: number; appId?: string }) => Promise<Record<string, unknown>>;
    sort: {
      RECENT: number;
      HELPFUL: number;
    };
  };
  export default store;
}
