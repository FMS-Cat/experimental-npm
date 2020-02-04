/**
 * `lerp`, or `mix`
 */
export function lerp( a: number, b: number, x: number ): number {
  return a + ( b - a ) * x;
}

/**
 * `clamp`
 */
export function clamp( x: number, l: number, h: number ): number {
  return Math.min( Math.max( x, l ), h );
}

/**
 * `clamp( x, 0.0, 1.0 )`
 */
export function saturate( x: number ): number {
  return clamp( x, 0.0, 1.0 );
}

/**
 * `smoothstep` but not smooth
 */
export function linearstep( a: number, b: number, x: number ): number {
  return saturate( ( x - a ) / ( b - a ) );
}

/**
 * world famous `smoothstep` function
 */
export function smoothstep( a: number, b: number, x: number ): number {
  const t = linearstep( a, b, x );
  return t * t * ( 3.0 - 2.0 * t );
}

/**
 * `smoothstep` but more smooth
 */
export function smootherstep( a: number, b: number, x: number ): number {
  const t = linearstep( a, b, x );
  return t * t * t * ( t * ( t * 6.0 - 15.0 ) + 10.0 );
}

/**
 * `smoothstep` but WAY more smooth
 */
export function smootheststep( a: number, b: number, x: number ): number {
  const t = linearstep( a, b, x );
  return t * t * t * t * ( t * ( t * ( -20.0 * t + 70.0 ) - 84.0 ) + 35.0 );
}
