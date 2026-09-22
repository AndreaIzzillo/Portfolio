export type NonEmptyArray<T> = [T, ...T[]];

export function mapNonEmpty<T, U>(
  items: NonEmptyArray<T>,
  transform: (item: T, index: number) => U,
): NonEmptyArray<U> {
  return [
    transform(items[0], 0),
    ...items.slice(1).map((item, index) => transform(item, index + 1)),
  ];
}
