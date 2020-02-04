/**
 * Iterable FizzBuzz
 */
export class FizzBuzz implements Iterable<number | string> {
  public static WordsDefault: Map<number, string> = new Map( [
    [ 3, 'Fizz' ],
    [ 5, 'Buzz' ]
  ] );

  private __words: Map<number, string>;
  private __index: number;
  private __end: number;

  public constructor( words: Map<number, string> = FizzBuzz.WordsDefault, index = 1, end = 100 ) {
    this.__words = words;
    this.__index = index;
    this.__end = end;
  }

  public [ Symbol.iterator ](): Iterator<string | number, any, undefined> {
    return this;
  }

  public next(): IteratorResult<number | string> {
    if ( this.__end < this.__index ) {
      return { done: true, value: null };
    }

    let value: number | string = '';
    for ( const [ rem, word ] of this.__words ) {
      if ( ( this.__index % rem ) === 0 ) {
        value += word;
      }
    }

    if ( value === '' ) {
      value = this.__index;
    }

    this.__index ++;

    return { done: false, value };
  }
}
