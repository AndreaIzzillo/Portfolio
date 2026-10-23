export const projectFilters = ["all", "graphics", "processing", "gpu"] as const;
export type ProjectFilter = (typeof projectFilters)[number];
export type ProjectCategory = Exclude<ProjectFilter, "all">;

export function filterProjects<T extends { categories: readonly ProjectCategory[] }>(
  projects: readonly T[],
  filter: ProjectFilter,
): readonly T[] {
  return filter === "all"
    ? projects
    : projects.filter((project) => project.categories.includes(filter));
}
