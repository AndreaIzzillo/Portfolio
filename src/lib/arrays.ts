export type NonEmptyArray<T> = [T, ...T[]];

export function requireAtLeastOne<T>(items: T[], message: string): NonEmptyArray<T> {
  const [first, ...rest] = items;
  if (!first) {
    throw new Error(message);
  }

  return [first, ...rest];
}

export function mapNonEmpty<T, U>(
  items: NonEmptyArray<T>,
  transform: (item: T, index: number) => U,
): NonEmptyArray<U> {
  return [transform(items[0], 0), ...items.slice(1).map(transform)];
}
