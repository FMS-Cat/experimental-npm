import { Matrix4, rawMatrix4 } from '../Matrix4';
import { Vector3 } from '../Vector3';
import { toBeCloseToArray } from './matchers/toBeCloseToArray';

const rawMatrixLookAtFrom345: rawMatrix4 = [
  0.8574929257125442, 0, -0.5144957554275265, 0,
  -0.2910427500435996, 0.824621125123532, -0.48507125007266594, 0,
  0.4242640687119285, 0.565685424949238, 0.7071067811865475, 0,
  3, 4, 5, 1
];

const rawMatrixInvLookAtFrom345: rawMatrix4 = [
  0.8574929257125443, -0.2910427500435996, 0.42426406871192857, 0,
  0, 0.8246211251235323, 0.5656854249492381, 0,
  -0.5144957554275266, -0.48507125007266605, 0.7071067811865476, 0,
  2.2204460492503136e-16, 4.440892098500627e-16, -7.071067811865476, 1
];

const rawMatrixCannotInvert: rawMatrix4 = [
  1, 2, 3, 4,
  5, 6, 7, 8,
  9, 10, 11, 12,
  13, 14, 15, 16
];

const rawMatrixLookAtFrom345To678: rawMatrix4 = [
  -0.7071067811865472, -2.7755575615628914e-17, 0.7071067811865475, 0,
  -0.4082482904638629, 0.816496580927726, -0.40824829046386296, 0,
  -0.5773502691896257, -0.5773502691896257, -0.5773502691896255, 0,
  3, 4, 5, 1
];

const rawMatrixInvLookAtFrom345To678: rawMatrix4 = [
  -0.7071067811865476, -0.40824829046386313, -0.577350269189626, 0,
  1.110223024625157e-16, 0.8164965809277259, -0.5773502691896257, 0,
  0.7071067811865478, -0.408248290463863, -0.5773502691896257, 0,
  -1.414213562373097, 8.881784197001256e-16, 6.92820323027551, 1
];

const rawMatrixLookAtFrom345To678Up100: rawMatrix4 = [
  2.220446049250313e-16, 0.7071067811865474, -0.7071067811865475,
  0, 0.8164965809277259, -0.40824829046386313, -0.4082482904638629, 0,
  -0.5773502691896257, -0.5773502691896257, -0.5773502691896257, 0,
  3, 4, 5, 1
];

const rawMatrixInvLookAtFrom345To678Up100: rawMatrix4 = [
  1.3877787807814462e-16, 0.8164965809277261, -0.577350269189626, 0,
  0.7071067811865477, -0.40824829046386324, -0.5773502691896257, 0,
  -0.7071067811865478, -0.40824829046386296, -0.5773502691896258, 0,
  0.7071067811865476, 1.2247448713915892, 6.9282032302755105, 1
];

const rawMatrixPerspectiveFov40Near1Far500: rawMatrix4 = [
  2.7474774194546225, 0, 0, 0,
  0, 2.7474774194546225, 0, 0,
  0, 0, -1.0040080160320641, -1,
  0, 0, -2.004008016032064, 0
];

beforeEach( () => {
  expect.extend( { toBeCloseToArray } );
} );

describe( 'Matrix4', () => {
  it( 'should be instantiated properly', () => {
    const matrix = new Matrix4();

    expect( matrix ).toBeInstanceOf( Matrix4 );
  } );

  describe( 'determinant', () => {
    it( 'should return a determinant of the matrix', () => {
      const matrix = new Matrix4( rawMatrixLookAtFrom345 );
      const det = matrix.determinant;

      expect( det ).toBeCloseTo( 1.0 );
    } );
  } );

  describe( 'inverse', () => {
    it( 'should return an inverse of the matrix', () => {
      const matrix = new Matrix4( rawMatrixLookAtFrom345 );
      const matrixInv = matrix.inverse;

      expect( matrixInv ).toBeInstanceOf( Matrix4 );

      expect( matrixInv!.elements ).toBeCloseToArray( rawMatrixInvLookAtFrom345 );
    } );

    it( 'should return a null instead if the matrix cannot be inverted', () => {
      const matrix = new Matrix4( rawMatrixCannotInvert );

      expect( matrix.inverse ).toBeNull();
    } );
  } );

  describe( 'lookAt', () => {
    it( 'should create a lookAt matrix correctly with 1 argument', () => {
      const matrix = Matrix4.lookAt(
        new Vector3( [ 3.0, 4.0, 5.0 ] )
      );

      expect( matrix ).toBeInstanceOf( Matrix4 );

      expect( matrix.elements ).toBeCloseToArray( rawMatrixLookAtFrom345 );
    } );

    it( 'should create a lookAt matrix correctly with 2 arguments', () => {
      const matrix = Matrix4.lookAt(
        new Vector3( [ 3.0, 4.0, 5.0 ] ),
        new Vector3( [ 6.0, 7.0, 8.0 ] )
      );

      expect( matrix ).toBeInstanceOf( Matrix4 );

      expect( matrix.elements ).toBeCloseToArray( rawMatrixLookAtFrom345To678 );
    } );

    it( 'should create a lookAt matrix correctly with 3 arguments', () => {
      const matrix = Matrix4.lookAt(
        new Vector3( [ 3.0, 4.0, 5.0 ] ),
        new Vector3( [ 6.0, 7.0, 8.0 ] ),
        new Vector3( [ 1.0, 0.0, 0.0 ] )
      );

      expect( matrix ).toBeInstanceOf( Matrix4 );

      expect( matrix.elements ).toBeCloseToArray( rawMatrixLookAtFrom345To678Up100 );
    } );
  } );

  describe( 'lookAtInverse', () => {
    it( 'should create the inverse of a lookAt matrix correctly with 1 argument', () => {
      const matrix = Matrix4.lookAtInverse(
        new Vector3( [ 3.0, 4.0, 5.0 ] )
      );

      expect( matrix ).toBeInstanceOf( Matrix4 );

      expect( matrix.elements ).toBeCloseToArray( rawMatrixInvLookAtFrom345 );
    } );

    it( 'should create a lookAt matrix correctly with 2 arguments', () => {
      const matrix = Matrix4.lookAtInverse(
        new Vector3( [ 3.0, 4.0, 5.0 ] ),
        new Vector3( [ 6.0, 7.0, 8.0 ] )
      );

      expect( matrix ).toBeInstanceOf( Matrix4 );

      expect( matrix.elements ).toBeCloseToArray( rawMatrixInvLookAtFrom345To678 );
    } );

    it( 'should create a lookAt matrix correctly with 3 arguments', () => {
      const matrix = Matrix4.lookAtInverse(
        new Vector3( [ 3.0, 4.0, 5.0 ] ),
        new Vector3( [ 6.0, 7.0, 8.0 ] ),
        new Vector3( [ 1.0, 0.0, 0.0 ] )
      );

      expect( matrix ).toBeInstanceOf( Matrix4 );

      expect( matrix.elements ).toBeCloseToArray( rawMatrixInvLookAtFrom345To678Up100 );
    } );
  } );

  describe( 'perspective', () => {
    it( 'should create a perspective matrix correctly', () => {
      const matrix = Matrix4.perspective( 40.0, 1.0, 500.0 );

      expect( matrix ).toBeInstanceOf( Matrix4 );

      expect( matrix.elements ).toBeCloseToArray( rawMatrixPerspectiveFov40Near1Far500 );
    } );
  } );
} );
