import { Vector3 } from '.';

export type rawMatrix4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

export const rawIdentityMatrix4: rawMatrix4 = [
  1.0, 0.0, 0.0, 0.0,
  0.0, 1.0, 0.0, 0.0,
  0.0, 0.0, 1.0, 0.0,
  0.0, 0.0, 0.0, 1.0
];

/**
 * A Matrix4.
 */
export class Matrix4 {
  public elements: rawMatrix4;

  public constructor( v: rawMatrix4 = rawIdentityMatrix4 ) {
    this.elements = v;
  }

  /**
   * Itself but transposed.
   */
  public get transposed(): Matrix4 {
    const m = this.elements;

    return new Matrix4( [
      m[ 0 ], m[ 4 ], m[ 8 ], m[ 12 ],
      m[ 1 ], m[ 5 ], m[ 9 ], m[ 13 ],
      m[ 2 ], m[ 6 ], m[ 10 ], m[ 14 ],
      m[ 3 ], m[ 7 ], m[ 11 ], m[ 15 ]
    ] );
  }

  /**
   * Itself but inverted.
   */
  public get inversed(): Matrix4 {
    const m = this.elements;
    const
      a00 = m[  0 ], a01 = m[  1 ], a02 = m[  2 ], a03 = m[  3 ],
      a10 = m[  4 ], a11 = m[  5 ], a12 = m[  6 ], a13 = m[  7 ],
      a20 = m[  8 ], a21 = m[  9 ], a22 = m[ 10 ], a23 = m[ 11 ],
      a30 = m[ 12 ], a31 = m[ 13 ], a32 = m[ 14 ], a33 = m[ 15 ],
      b00 = a00 * a11 - a01 * a10,  b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,  b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,  b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,  b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,  b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,  b11 = a22 * a33 - a23 * a32;

    const det = 1.0 / b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    return new Matrix4( [
      a11 * b11 - a12 * b10 + a13 * b09,
      a02 * b10 - a01 * b11 - a03 * b09,
      a31 * b05 - a32 * b04 + a33 * b03,
      a22 * b04 - a21 * b05 - a23 * b03,
      a12 * b08 - a10 * b11 - a13 * b07,
      a00 * b11 - a02 * b08 + a03 * b07,
      a32 * b02 - a30 * b05 - a33 * b01,
      a20 * b05 - a22 * b02 + a23 * b01,
      a10 * b10 - a11 * b08 + a13 * b06,
      a01 * b08 - a00 * b10 - a03 * b06,
      a30 * b04 - a31 * b02 + a33 * b00,
      a21 * b02 - a20 * b04 - a23 * b00,
      a11 * b07 - a10 * b09 - a12 * b06,
      a00 * b09 - a01 * b07 + a02 * b06,
      a31 * b01 - a30 * b03 - a32 * b00,
      a20 * b03 - a21 * b01 + a22 * b00
    ].map( ( v ) => v * det ) as rawMatrix4 );
  }

  /**
   * Clone this.
   */
  public clone(): Matrix4 {
    return new Matrix4( this.elements.concat() as rawMatrix4 );
  }

  /**
   * Multiply this Matrix4 by one or more Matrix4s.
   */
  public multiply( ...matrices: Matrix4[] ): Matrix4 {
    if ( matrices.length === 0 ) {
      return this.clone();
    }

    const arr = matrices.concat();
    let bMat = arr.shift()!;
    if ( 0 < arr.length ) {
      bMat = bMat.multiply( ...arr );
    }

    const a = this.elements;
    const b = bMat.elements;

    return new Matrix4( [
      a[ 0 ] * b[ 0 ] + a[ 4 ] * b[ 1 ] + a[ 8 ] * b[ 2 ] + a[ 12 ] * b[ 3 ],
      a[ 1 ] * b[ 0 ] + a[ 5 ] * b[ 1 ] + a[ 9 ] * b[ 2 ] + a[ 13 ] * b[ 3 ],
      a[ 2 ] * b[ 0 ] + a[ 6 ] * b[ 1 ] + a[ 10 ] * b[ 2 ] + a[ 14 ] * b[ 3 ],
      a[ 3 ] * b[ 0 ] + a[ 7 ] * b[ 1 ] + a[ 11 ] * b[ 2 ] + a[ 15 ] * b[ 3 ],

      a[ 0 ] * b[ 4 ] + a[ 4 ] * b[ 5 ] + a[ 8 ] * b[ 6 ] + a[ 12 ] * b[ 7 ],
      a[ 1 ] * b[ 4 ] + a[ 5 ] * b[ 5 ] + a[ 9 ] * b[ 6 ] + a[ 13 ] * b[ 7 ],
      a[ 2 ] * b[ 4 ] + a[ 6 ] * b[ 5 ] + a[ 10 ] * b[ 6 ] + a[ 14 ] * b[ 7 ],
      a[ 3 ] * b[ 4 ] + a[ 7 ] * b[ 5 ] + a[ 11 ] * b[ 6 ] + a[ 15 ] * b[ 7 ],

      a[ 0 ] * b[ 8 ] + a[ 4 ] * b[ 9 ] + a[ 8 ] * b[ 10 ] + a[ 12 ] * b[ 11 ],
      a[ 1 ] * b[ 8 ] + a[ 5 ] * b[ 9 ] + a[ 9 ] * b[ 10 ] + a[ 13 ] * b[ 11 ],
      a[ 2 ] * b[ 8 ] + a[ 6 ] * b[ 9 ] + a[ 10 ] * b[ 10 ] + a[ 14 ] * b[ 11 ],
      a[ 3 ] * b[ 8 ] + a[ 7 ] * b[ 9 ] + a[ 11 ] * b[ 10 ] + a[ 15 ] * b[ 11 ],

      a[ 0 ] * b[ 12 ] + a[ 4 ] * b[ 13 ] + a[ 8 ] * b[ 14 ] + a[ 12 ] * b[ 15 ],
      a[ 1 ] * b[ 12 ] + a[ 5 ] * b[ 13 ] + a[ 9 ] * b[ 14 ] + a[ 13 ] * b[ 15 ],
      a[ 2 ] * b[ 12 ] + a[ 6 ] * b[ 13 ] + a[ 10 ] * b[ 14 ] + a[ 14 ] * b[ 15 ],
      a[ 3 ] * b[ 12 ] + a[ 7 ] * b[ 13 ] + a[ 11 ] * b[ 14 ] + a[ 15 ] * b[ 15 ]
    ] );
  }

  /**
   * Multiply this Matrix4 by a scalar
   */
  public scaleScalar( scalar: number ): Matrix4 {
    return new Matrix4( this.elements.map( ( v ) => v * scalar ) as rawMatrix4 );
  }

  /**
   * An identity Matrix4.
   */
  public static get identity(): Matrix4 {
    return new Matrix4( rawIdentityMatrix4 );
  }

  public static multiply( ...matrices: Matrix4[] ): Matrix4 {
    if ( matrices.length === 0 ) {
      return Matrix4.identity;
    } else {
      const bMats = matrices.concat();
      const aMat = bMats.shift()!;
      return aMat.multiply( ...bMats );
    }
  }

  /**
   * Generate a translation matrix.
   * @param vector Translation
   */
  public static translate( vector: Vector3 ): Matrix4 {
    return new Matrix4( [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      vector.x, vector.y, vector.z, 1
    ] );
  }

  /**
   * Generate a 3d scaling matrix.
   * @param vector Scale
   */
  public static scale( vector: Vector3 ): Matrix4 {
    return new Matrix4( [
      vector.x, 0, 0, 0,
      0, vector.y, 0, 0,
      0, 0, vector.z, 0,
      0, 0, 0, 1
    ] );
  }

  /**
   * Generate a 3d scaling matrix by a scalar.
   * @param vector Scale
   */
  public static scaleScalar( scalar: number ): Matrix4 {
    return new Matrix4( [
      scalar, 0, 0, 0,
      0, scalar, 0, 0,
      0, 0, scalar, 0,
      0, 0, 0, 1
    ] );
  }

  /**
   * Generate a 3d rotation matrix, rotates around x axis.
   * @param vector Scale
   */
  public static rotateX( theta: number ): Matrix4 {
    return new Matrix4( [
      1, 0, 0, 0,
      0, Math.cos( theta ), -Math.sin( theta ), 0,
      0, Math.sin( theta ), Math.cos( theta ), 0,
      0, 0, 0, 1
    ] );
  }

  /**
   * Generate a 3d rotation matrix, rotates around y axis.
   * @param vector Scale
   */
  public static rotateY( theta: number ): Matrix4 {
    return new Matrix4( [
      Math.cos( theta ), 0, Math.sin( theta ), 0,
      0, 1, 0, 0,
      -Math.sin( theta ), 0, Math.cos( theta ), 0,
      0, 0, 0, 1
    ] );
  }

  /**
   * Generate a 3d rotation matrix, rotates around z axis.
   * @param vector Scale
   */
  public static rotateZ( theta: number ): Matrix4 {
    return new Matrix4( [
      Math.cos( theta ), -Math.sin( theta ), 0, 0,
      Math.sin( theta ), Math.cos( theta ), 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ] );
  }

  /**
   * Generate a "LookAt" view matrix.
   */
  public static lookAt(
    position: Vector3,
    target = new Vector3( [ 0.0, 0.0, 0.0 ] ),
    up = new Vector3( [ 0.0, 1.0, 0.0 ] ),
    roll = 0.0
  ): Matrix4 {
    const dir = target.sub( position ).normalized;
    let sid = dir.cross( up ).normalized;
    let top = sid.cross( dir );
    sid = sid.scale( Math.cos( roll ) ).add( top.scale( Math.sin( roll ) ) );
    top = sid.cross( dir );

    return new Matrix4( [
      sid.x, top.x, dir.x, 0.0,
      sid.y, top.y, dir.y, 0.0,
      sid.z, top.z, dir.z, 0.0,
      -sid.x * position.x - sid.y * position.y - sid.z * position.z,
      -top.x * position.x - top.y * position.y - top.z * position.z,
      -dir.x * position.x - dir.y * position.y - dir.z * position.z,
      1.0
    ] );
  }

  /**
   * Generate a "Perspective" projection matrix.
   * It won't include aspect!
   */
  public static perspective( fov = 45.0, near = 0.01, far = 100.0 ): Matrix4 {
    const p = 1.0 / Math.tan( fov * Math.PI / 360.0 );
    const d = ( far - near );
    return new Matrix4( [
      p, 0.0, 0.0, 0.0,
      0.0, p, 0.0, 0.0,
      0.0, 0.0, ( far + near ) / d, 1.0,
      0.0, 0.0, -2 * far * near / d, 0.0
    ] );
  }
}
