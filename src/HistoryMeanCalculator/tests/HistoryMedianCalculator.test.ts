import { HistoryMedianCalculator } from '../HistoryMedianCalculator';

describe( 'HistoryMedianCalculator', () => {
  it( 'should return a median properly (array is not fully populated)', () => {
    const calc = new HistoryMedianCalculator( 10 );
    calc.push( 12 );
    calc.push( 4 );
    calc.push( 3 );
    calc.push( 9 );
    calc.push( 19 );
    expect( calc.median ).toBe( 9 );
  } );

  it( 'should return a median properly (array is fully populated)', () => {
    const calc = new HistoryMedianCalculator( 5 );
    calc.push( 2 );
    calc.push( 3 );
    calc.push( 4 );
    calc.push( 5 );
    calc.push( 6 );
    calc.push( 7 );
    calc.push( 8 );
    expect( calc.median ).toBe( 6 );
  } );
} );
