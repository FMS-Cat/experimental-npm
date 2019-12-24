/**
 * Iterable FizzBuzz
 */
export class FizzBuzz implements Iterable<number | string> {
  public static WordsDefault: Map<number, string> = new Map( [
    [ 3, 'Fizz' ],
    [ 5, 'Buzz' ]
  ] );

  private _words: Map<number, string>;
  private _index: number;
  private _end: number;

  public constructor( words: Map<number, string> = FizzBuzz.WordsDefault, index = 1, end = 100 ) {
    this._words = words;
    this._index = index;
    this._end = end;
  }

  public [ Symbol.iterator ](): Iterator<string | number, any, undefined> {
    return this;
  }

  public next(): IteratorResult<number | string> {
    if ( this._end < this._index ) {
      return { done: true, value: null };
    }

    let value: number | string = '';
    for ( const [ rem, word ] of this._words ) {
      if ( ( this._index % rem ) === 0 ) {
        value += word;
      }
    }

    if ( value === '' ) {
      value = this._index;
    }

    this._index ++;

    return { done: false, value };
  }
}
