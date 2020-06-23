// yoinked from https://github.com/mapbox/tiny-sdf (BSD 2-Clause)
// implements http://people.cs.uchicago.edu/~pff/papers/dt.pdf

/**
 * Compute a one dimensional edt from the source data.
 * Returning distance will be squared.
 * Intended to be used internally in {@link edt2d}.
 *
 * @param data Data of the source
 * @param offset Offset of the source from beginning
 * @param stride Stride of the source
 * @param length Length of the source
 */
export function edt1d(
  data: Float32Array,
  offset: number,
  stride: number,
  length: number
): void {
  // index of rightmost parabola in lower envelope
  let k = 0;

  // locations of parabolas in lower envelope
  const v = new Float32Array( length );
  v[ 0 ] = 0.0;

  // locations of boundaries between parabolas
  const z = new Float32Array( length + 1 );
  z[ 0 ] = -Infinity;
  z[ 1 ] = Infinity;

  // create a straight array of input data
  const f = new Float32Array( length );
  for ( let q = 0; q < length; q ++ ) {
    f[ q ] = data[ offset + q * stride ];
  }

  // compute lower envelope
  for ( let q = 1; q < length; q ++ ) {
    let s = 0.0;

    while ( 0 <= k ) {
      s = ( f[ q ] + q * q - f[ v[ k ] ] - v[ k ] * v[ k ] ) / ( 2.0 * q - 2.0 * v[ k ] );
      if ( s <= z[ k ] ) {
        k --;
      } else {
        break;
      }
    }

    k ++;
    v[ k ] = q;
    z[ k ] = s;
    z[ k + 1 ] = Infinity;
  }

  k = 0;

  // fill in values of distance transform
  for ( let q = 0; q < length; q ++ ) {
    while ( z[ k + 1 ] < q ) { k ++; }
    const qSubVK = q - v[ k ];
    data[ offset + q * stride ] = f[ v[ k ] ] + qSubVK * qSubVK;
  }
}

/**
 * Compute a two dimensional edt from the source data.
 * Returning distance will be squared.
 *
 * @param data Data of the source.
 * @param width Width of the source.
 * @param height Height of the source.
 */
export function edt2d(
  data: Float32Array,
  width: number,
  height: number
): void {
  for ( let x = 0; x < width; x ++ ) {
    edt1d( data, x, width, height );
  }

  for ( let y = 0; y < height; y ++ ) {
    edt1d( data, y * width, 1, width );
  }
}
