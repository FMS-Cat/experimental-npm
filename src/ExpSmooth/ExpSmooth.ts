import { lerp } from '..';

/**
 * Do exp smoothing
 */
export class ExpSmooth {
  public factor = 10.0;
  public target = 0.0;
  public value = 0.0;

  public update( deltaTime: number ): number {
    this.value = lerp( this.target, this.value, Math.exp( -this.factor * deltaTime ) );
    return this.value;
  }
}
