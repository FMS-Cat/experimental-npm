import { Matrix4 } from './Matrix4';
import { Vector } from './Vector';

export type rawVector4 = [ number, number, number, number ];

/**
 * A Vector3.
 */
export class Vector4 extends Vector<Vector4> {
  public elements: rawVector4;

  public constructor( v: rawVector4 = [ 0.0, 0.0, 0.0, 0.0 ] ) {
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
   * A y component of this.
   */
  public get y(): number {
    return this.elements[ 1 ];
  }

  public set y( y: number ) {
    this.elements[ 1 ] = y;
  }

  /**
   * A z component of this.
   */
  public get z(): number {
    return this.elements[ 2 ];
  }

  public set z( z: number ) {
    this.elements[ 2 ] = z;
  }

  /**
   * A w component of this.
   */
  public get w(): number {
    return this.elements[ 3 ];
  }

  public set w( z: number ) {
    this.elements[ 3 ] = z;
  }

  public toString(): string {
    return `Vector4( ${ this.x.toFixed( 3 ) }, ${ this.y.toFixed( 3 ) }, ${ this.z.toFixed( 3 ) }, ${ this.w.toFixed( 3 ) } )`;
  }

  /**
   * Multiply this vector (with an implicit 1 in the 4th dimension) by m.
   */
  public applyMatrix4( matrix: Matrix4 ): Vector4 {
    const m = matrix.elements;

    return new Vector4( [
      m[ 0 ] * this.x + m[ 4 ] * this.y + m[ 8 ] * this.z + m[ 12 ] * this.w,
      m[ 1 ] * this.x + m[ 5 ] * this.y + m[ 9 ] * this.z + m[ 13 ] * this.w,
      m[ 2 ] * this.x + m[ 6 ] * this.y + m[ 10 ] * this.z + m[ 14 ] * this.w,
      m[ 3 ] * this.x + m[ 7 ] * this.y + m[ 11 ] * this.z + m[ 15 ] * this.w
    ] );
  }

  protected __new( v: rawVector4 ): Vector4 {
    return new Vector4( v );
  }

  /**
   * Vector4( 0.0, 0.0, 0.0, 0.0 )
   */
  public static get zero(): Vector4 {
    return new Vector4( [ 0.0, 0.0, 0.0, 0.0 ] );
  }

  /**
   * Vector4( 1.0, 1.0, 1.0, 1.0 )
   */
  public static get one(): Vector4 {
    return new Vector4( [ 1.0, 1.0, 1.0, 1.0 ] );
  }
}
