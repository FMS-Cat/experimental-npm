import { Matrix4, Vector3 } from '.';

export type rawQuaternion = [ number, number, number, number ];

export const rawIdentityQuaternion: rawQuaternion = [ 0.0, 0.0, 0.0, 1.0 ];

/**
 * A Quaternion.
 */
export class Quaternion {
  public elements: rawQuaternion; // [ x, y, z; w ]

  public constructor( elements: rawQuaternion = rawIdentityQuaternion ) {
    this.elements = elements;
  }

  /**
   * An x component of this.
   */
  public get x(): number {
    return this.elements[ 0 ];
  }

  /**
   * An y component of this.
   */
  public get y(): number {
    return this.elements[ 1 ];
  }

  /**
   * An z component of this.
   */
  public get z(): number {
    return this.elements[ 2 ];
  }

  /**
   * An w component of this.
   */
  public get w(): number {
    return this.elements[ 3 ];
  }

  /**
   * Clone this.
   */
  public clone(): Quaternion {
    return new Quaternion( this.elements.concat() as rawQuaternion );
  }

  /**
   * Itself but converted into a Matrix4.
   */
  public get matrix(): Matrix4 {
    const x = new Vector3( [ 1.0, 0.0, 0.0 ] ).applyQuaternion( this );
    const y = new Vector3( [ 0.0, 1.0, 0.0 ] ).applyQuaternion( this );
    const z = new Vector3( [ 0.0, 0.0, 1.0 ] ).applyQuaternion( this );

    return new Matrix4( [
      x.x, y.x, z.x, 0.0,
      x.y, y.y, z.y, 0.0,
      x.z, y.z, z.z, 0.0,
      0.0, 0.0, 0.0, 1.0
    ] );
  }

  /**
   * An inverse of this.
   */
  public get inversed(): Quaternion {
    return new Quaternion( [
      -this.x,
      -this.y,
      -this.z,
      this.w
    ] );
  }

  /**
   * Multiply two Quaternions.
   * @param q Another Quaternion
   */
  public multiply( q: Quaternion ): Quaternion {
    return new Quaternion( [
      this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
      this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
      this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
      this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
    ] );
  }

  /**
   * An identity Quaternion.
   */
  public static get identity(): Quaternion {
    return new Quaternion( rawIdentityQuaternion );
  }

  /**
   * Generate a Quaternion out of angle and axis.
   */
  public static fromAxisAngle( axis: Vector3, angle: number ): Quaternion {
    const halfAngle = angle / 2.0;
    const sinHalfAngle = Math.sin( halfAngle );
    return new Quaternion( [
      axis.x * sinHalfAngle,
      axis.y * sinHalfAngle,
      axis.z * sinHalfAngle,
      Math.cos( halfAngle )
    ] );
  }

  /**
   * Generate a Quaternion out of a rotation matrix.
   * Yoinked from Three.js.
   */
  public static fromMatrix( matrix: Matrix4 ): Quaternion {
    const m = matrix.elements,
      m11 = m[ 0 ], m12 = m[ 4 ], m13 = m[ 8 ],
      m21 = m[ 1 ], m22 = m[ 5 ], m23 = m[ 9 ],
      m31 = m[ 2 ], m32 = m[ 6 ], m33 = m[ 10 ],
      trace = m11 + m22 + m33;

    if ( trace > 0 ) {
      const s = 0.5 / Math.sqrt( trace + 1.0 );
      return new Quaternion( [
        ( m32 - m23 ) * s,
        ( m13 - m31 ) * s,
        ( m21 - m12 ) * s,
        0.25 / s
      ] );
    } else if ( m11 > m22 && m11 > m33 ) {
      const s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );
      return new Quaternion( [
        0.25 * s,
        ( m12 + m21 ) / s,
        ( m13 + m31 ) / s,
        ( m32 - m23 ) / s
      ] );
    } else if ( m22 > m33 ) {
      const s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );
      return new Quaternion( [
        ( m12 + m21 ) / s,
        0.25 * s,
        ( m23 + m32 ) / s,
        ( m13 - m31 ) / s
      ] );
    } else {
      const s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );
      return new Quaternion( [
        ( m13 + m31 ) / s,
        ( m23 + m32 ) / s,
        0.25 * s,
        ( m21 - m12 ) / s
      ] );
    }
  }
}
