import { Matrix4 } from '../Matrix4';
import { Vector3 } from '../Vector3';
import { toBeCloseToArray } from './matchers/toBeCloseToArray';

beforeEach( () => {
  expect.extend( { toBeCloseToArray } );
} );

describe( 'Matrix4', () => {
  it( 'should be instantiated properly', () => {
    const matrix = new Matrix4();

    expect( matrix ).toBeInstanceOf( Matrix4 );
  } );

  describe( 'lookAt', () => {
    it( 'should create a lookAt matrix correctly with 1 argument', () => {
      const matrix = Matrix4.lookAt(
        new Vector3( [ 3.0, 4.0, 5.0 ] )
      );

      expect( matrix ).toBeInstanceOf( Matrix4 );

      expect( matrix.elements ).toBeCloseToArray( [
        0.8574929257125442, 0, -0.5144957554275265, 0,
        -0.2910427500435996, 0.824621125123532, -0.48507125007266594, 0,
        0.4242640687119285, 0.565685424949238, 0.7071067811865475, 0,
        3, 4, 5, 1
      ] );
    } );

    it( 'should create a lookAt matrix correctly with 2 arguments', () => {
      const matrix = Matrix4.lookAt(
        new Vector3( [ 3.0, 4.0, 5.0 ] ),
        new Vector3( [ 6.0, 7.0, 8.0 ] )
      );

      expect( matrix ).toBeInstanceOf( Matrix4 );

      expect( matrix.elements ).toBeCloseToArray( [
        -0.7071067811865472, -2.7755575615628914e-17, 0.7071067811865475, 0,
        -0.4082482904638629, 0.816496580927726, -0.40824829046386296, 0,
        -0.5773502691896257, -0.5773502691896257, -0.5773502691896255, 0,
        3, 4, 5, 1
      ] );
    } );

    it( 'should create a lookAt matrix correctly with 3 arguments', () => {
      const matrix = Matrix4.lookAt(
        new Vector3( [ 3.0, 4.0, 5.0 ] ),
        new Vector3( [ 6.0, 7.0, 8.0 ] ),
        new Vector3( [ 1.0, 0.0, 0.0 ] )
      );

      expect( matrix ).toBeInstanceOf( Matrix4 );

      expect( matrix.elements ).toBeCloseToArray( [
        2.220446049250313e-16, 0.7071067811865474, -0.7071067811865475,
        0, 0.8164965809277259, -0.40824829046386313, -0.4082482904638629, 0,
        -0.5773502691896257, -0.5773502691896257, -0.5773502691896257, 0,
        3, 4, 5, 1
      ] );
    } );
  } );

  describe( 'perspective', () => {
    it( 'should create a perspective matrix correctly', () => {
      const matrix = Matrix4.perspective( 30.0, 0.01, 20.0 );

      expect( matrix ).toBeInstanceOf( Matrix4 );

      expect( matrix.elements ).toBeCloseToArray( [
        3.7320508075688776, 0, 0, 0,
        0, 3.7320508075688776, 0, 0,
        0, 0, -1.0010005002501252, -1,
        0, 0, -0.020010005002501254, 0
      ] );
    } );
  } );
} );
