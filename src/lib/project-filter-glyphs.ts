import type { ProjectFilter } from "@/lib/project-filters";

export const filterGlyphs: Record<ProjectFilter, string> = {
  all: "M10.5 7.5a3 3 0 1 1-6 0 3 3 0 1 1 6 0ZM19.5 7.5a3 3 0 1 1-6 0 3 3 0 1 1 6 0ZM10.5 16.5a3 3 0 1 1-6 0 3 3 0 1 1 6 0ZM19.5 16.5a3 3 0 1 1-6 0 3 3 0 1 1 6 0Z",
  favorites:
    "M20.7 5.7a4.8 4.8 0 0 0-6.8 0L12 7.6l-1.9-1.9a4.8 4.8 0 0 0-6.8 6.8L12 21l8.7-8.5a4.8 4.8 0 0 0 0-6.8Z",
  graphics:
    "m12 2.8 8.5 4.8v8.8L12 21.2l-8.5-4.8V7.6L12 2.8Zm0 9.6 8.5-4.8M12 12.4 3.5 7.6m8.5 4.8v8.8",
  processing:
    "M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3ZM6.5 9.5h11m-11 5h11M10 7.5v4m4 1v4",
  gpu: "M7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9A2.5 2.5 0 0 1 7.5 5ZM10 9h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1ZM9 2.5V5m6-2.5V5M9 19v2.5m6-2.5v2.5M2.5 9H5m-2.5 6H5m14-6h2.5M19 15h2.5",
};
