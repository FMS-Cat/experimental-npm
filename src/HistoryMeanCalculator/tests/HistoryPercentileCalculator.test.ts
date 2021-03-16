import { HistoryPercentileCalculator } from '../HistoryPercentileCalculator';

describe( 'HistoryPercentileCalculator', () => {
  it( 'should return a median properly (array is partially populated)', () => {
    const calc = new HistoryPercentileCalculator( 10 );
    calc.push( 12 );
    calc.push( 4 );
    calc.push( 3 );
    calc.push( 9 );
    calc.push( 19 );
    expect( calc.median ).toBe( 9 );
  } );

  it( 'should return a median properly (array is fully populated)', () => {
    const calc = new HistoryPercentileCalculator( 5 );
    calc.push( 2 );
    calc.push( 3 );
    calc.push( 4 );
    calc.push( 5 );
    calc.push( 6 );
    calc.push( 7 );
    calc.push( 8 );
    expect( calc.median ).toBe( 6 );
  } );

  it( 'should return a median properly (array is fully populated, the first one is the biggest)', () => {
    const calc = new HistoryPercentileCalculator( 5 );
    calc.push( 8 );
    calc.push( 6 );
    calc.push( 4 );
    calc.push( 2 );
    calc.push( 3 );
    calc.push( 5 );
    calc.push( 7 );
    expect( calc.median ).toBeCloseTo( 4 );
  } );
} );
