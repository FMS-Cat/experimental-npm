// yoinked from https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers

export function binarySearch(
  element: number,
  array: ArrayLike<number>
): number {
  let start = 0;
  let end = array.length;

  while ( start < end ) {
    const center = ( start + end ) >> 1;
    if ( array[ center ] < element ) {
      start = center + 1;
    } else {
      end = center;
    }
  }

  return start;
}
