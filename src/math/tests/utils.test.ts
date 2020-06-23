import { range } from '../utils';

describe( 'range', () => {
  it( 'should be instantiated properly', () => {
    expect( range( 127.0, 0.0, 255.0, -1.0, 1.0 ) ).toBeCloseTo( -0.003921568 );
  } );
} );
