import { binarySearch } from '../binarySearch';

describe( 'binarySearch', () => {
  it( 'should find a correct index (has the same value)', () => {
    const result = binarySearch( 5, [ 1, 5, 9, 14, 18 ] );
    expect( result ).toBe( 1 );
  } );

  it( 'should find a correct index (doesn\'t have a same value)', () => {
    const result = binarySearch( 15, [ 1, 5, 9, 14, 18 ] );
    expect( result ).toBe( 4 );
  } );

  it( 'should find a correct index (too low)', () => {
    const result = binarySearch( 0, [ 1, 5, 9, 14, 18 ] );
    expect( result ).toBe( 0 );
  } );

  it( 'should find a correct index (too high)', () => {
    const result = binarySearch( 22, [ 1, 5, 9, 14, 18 ] );
    expect( result ).toBe( 5 );
  } );
} );
