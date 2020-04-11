import { binarySearch } from '../algorithm/binarySearch';

/**
 * Useful for tap tempo
 * See also: {@link HistoryMeanCalculator}
 */
export class HistoryMedianCalculator {
  private __history: number[] = [];
  private __sorted: number[] = [];
  private __index = 0;
  private readonly __length: number;

  public constructor( length: number ) {
    this.__length = length;
  }

  public get median(): number {
    const count = Math.min( this.__sorted.length, this.__length );
    return this.__sorted[ Math.floor( ( count - 1 ) / 2 ) ];
  }

  public reset(): void {
    this.__index = 0;
    this.__history = [];
    this.__sorted = [];
  }

  public push( value: number ): void {
    const prev = this.__history[ this.__index ];
    this.__history[ this.__index ] = value;
    this.__index = ( this.__index + 1 ) % this.__length;

    // remove the prev from sorted array
    if ( this.__sorted.length === this.__length ) {
      const prevIndex = binarySearch( prev, this.__sorted );
      this.__sorted.splice( prevIndex, 1 );
    }

    const index = binarySearch( value, this.__sorted );
    this.__sorted.splice( index, 0, value );
  }
}
