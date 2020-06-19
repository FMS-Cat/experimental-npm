import { Matrix4 } from './Matrix4';
import { Quaternion } from './Quaternion';
import { Vector } from './Vector';

export type rawVector3 = [ number, number, number ];

/**
 * A Vector3.
 */
export class Vector3 extends Vector<Vector3> {
  public elements: rawVector3;

  public constructor( v: rawVector3 = [ 0.0, 0.0, 0.0 ] ) {
    super();
    this.elements = v;
  }

  /**
   * An x component of this.
   */
  public get x(): number {
    return this.elements[ 0 ];
  }

  public set x( x: number ) {
    this.elements[ 0 ] = x;
  }

  /**
   * An y component of this.
   */
  public get y(): number {
    return this.elements[ 1 ];
  }

  public set y( y: number ) {
    this.elements[ 1 ] = y;
  }

  /**
   * An z component of this.
   */
  public get z(): number {
    return this.elements[ 2 ];
  }

  public set z( z: number ) {
    this.elements[ 2 ] = z;
  }

  public toString(): string {
    return `Vector3( ${ this.x.toFixed( 3 ) }, ${ this.y.toFixed( 3 ) }, ${ this.z.toFixed( 3 ) } )`;
  }

  /**
   * Return a cross of this and another Vector3.
   * @param vector Another vector
   */
  public cross( vector: Vector3 ): Vector3 {
    return new Vector3( [
      this.y * vector.z - this.z * vector.y,
      this.z * vector.x - this.x * vector.z,
      this.x * vector.y - this.y * vector.x
    ] );
  }

  /**
   * Rotate this vector using a Quaternion.
   * @param quaternion A quaternion
   */
  public applyQuaternion( quaternion: Quaternion ): Vector3 {
    const p = new Quaternion( [ this.x, this.y, this.z, 0.0 ] );
    const r = quaternion.inversed;
    const res = quaternion.multiply( p ).multiply( r );
    return new Vector3( [ res.x, res.y, res.z ] );
  }

  /**
   * Multiply this vector (with an implicit 1 in the 4th dimension) by m.
   */
  public applyMatrix4( matrix: Matrix4 ): Vector3 {
    const m = matrix.elements;

    const w = m[ 3 ] * this.x + m[ 7 ] * this.y + m[ 11 ] * this.z + m[ 15 ];
    const invW = 1.0 / w;

    return new Vector3( [
      ( m[ 0 ] * this.x + m[ 4 ] * this.y + m[ 8 ] * this.z + m[ 12 ] ) * invW,
      ( m[ 1 ] * this.x + m[ 5 ] * this.y + m[ 9 ] * this.z + m[ 13 ] ) * invW,
      ( m[ 2 ] * this.x + m[ 6 ] * this.y + m[ 10 ] * this.z + m[ 14 ] ) * invW
    ] );
  }

  protected __new( v: rawVector3 ): Vector3 {
    return new Vector3( v );
  }

  /**
   * Vector3( 0.0, 0.0, 0.0 )
   */
  public static get zero(): Vector3 {
    return new Vector3( [ 0.0, 0.0, 0.0 ] );
  }

  /**
   * Vector3( 1.0, 1.0, 1.0 )
   */
  public static get one(): Vector3 {
    return new Vector3( [ 1.0, 1.0, 1.0 ] );
  }
}
