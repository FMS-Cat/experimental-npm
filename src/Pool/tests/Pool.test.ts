import { Pool } from '../Pool';

describe( 'Pool', () => {
  const a = [ 'a' ];
  const b = [ 'b' ];
  const c = [ 'c' ];

  let pool: Pool<string[]>;

  it( 'should be instantiated properly', () => {
    pool = new Pool( [ a, b, c ] );
    expect( pool ).toBeInstanceOf( Pool );
  } );

  describe( 'current', () => {
    it( 'should return the first element by default', () => {
      pool = new Pool( [ a, b, c ] );
      expect( pool.current ).toBe( a );
    } );

    it( 'should return the second element after calling `next` once', () => {
      pool = new Pool( [ a, b, c ] );
      pool.next();
      expect( pool.current ).toBe( b );
    } );

    it( 'should return the third element after calling `next` twice', () => {
      pool = new Pool( [ a, b, c ] );
      pool.next();
      pool.next();
      expect( pool.current ).toBe( c );
    } );

    it( 'should return the first element after calling `next` the same times as the length of the array', () => {
      pool = new Pool( [ a, b, c ] );
      pool.next();
      pool.next();
      pool.next();
      expect( pool.current ).toBe( a );
    } );
  } );

  describe( 'next', () => {
    it( 'should return the second element', () => {
      pool = new Pool( [ a, b, c ] );
      expect( pool.next() ).toBe( b );
    } );
  } );
} );
