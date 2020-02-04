/**
 * A Vector.
 */
export abstract class Vector<T extends Vector<T>> {
  public abstract elements: number[];

  /**
   * The length of this.
   * a.k.a. `magnitude`
   */
  public get length(): number {
    return Math.sqrt( this.elements.reduce( ( sum, v ) => sum + v * v, 0.0 ) );
  }

  /**
   * A normalized Vector3 of this.
   */
  public get normalized(): T {
    return this.scale( 1.0 / this.length );
  }

  /**
   * Clone this.
   */
  public clone(): T {
    return this.__new( this.elements.concat() );
  }

  /**
   * Add a Vector into this.
   * @param vector Another Vector
   */
  public add( vector: T ): T {
    return this.__new( this.elements.map( ( v, i ) => v + vector.elements[ i ] ) );
  }

  /**
   * Substract this from another Vector.
   * @param v Another vector
   */
  public sub( vector: T ): T {
    return this.__new( this.elements.map( ( v, i ) => v - vector.elements[ i ] ) );
  }

  /**
   * Multiply a Vector with this.
   * @param vector Another Vector
   */
  public multiply( vector: T ): T {
    return this.__new( this.elements.map( ( v, i ) => v * vector.elements[ i ] ) );
  }

  /**
   * Divide this from another Vector.
   * @param vector Another Vector
   */
  public divide( vector: T ): T {
    return this.__new( this.elements.map( ( v, i ) => v / vector.elements[ i ] ) );
  }

  /**
   * Scale this by scalar.
   * a.k.a. `multiplyScalar`
   * @param scalar A scalar
   */
  public scale( scalar: number ): T {
    return this.__new( this.elements.map( ( v ) => v * scalar ) );
  }

  /**
   * Dot two Vectors.
   * @param vector Another vector
   */
  public dot( vector: T ): number {
    return this.elements.reduce( ( sum, v, i ) => sum + v * vector.elements[ i ], 0.0 );
  }

  protected abstract __new( v: number[] ): T;
}
