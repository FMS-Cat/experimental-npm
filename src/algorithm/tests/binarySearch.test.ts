import { binarySearch } from '../binarySearch';

describe( 'binarySearch', () => {
  describe( 'when it uses an element', () => {
    it( 'should find a correct index (has the same value)', () => {
      const result = binarySearch( [ 1, 5, 9, 14, 18 ], 5 );
      expect( result ).toBe( 1 );
    } );

    it( 'should find a correct index (has multiple same values)', () => {
      const result = binarySearch( [ 1, 5, 5, 5, 18 ], 5 );
      expect( result ).toBe( 1 );
    } );

    it( 'should find a correct index (doesn\'t have a same value)', () => {
      const result = binarySearch( [ 1, 5, 9, 14, 18 ], 15 );
      expect( result ).toBe( 4 );
    } );

    it( 'should find a correct index (too low)', () => {
      const result = binarySearch( [ 1, 5, 9, 14, 18 ], 0 );
      expect( result ).toBe( 0 );
    } );

    it( 'should find a correct index (too high)', () => {
      const result = binarySearch( [ 1, 5, 9, 14, 18 ], 22 );
      expect( result ).toBe( 5 );
    } );
  } );
} );
