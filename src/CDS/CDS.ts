/**
 * Critically Damped Spring
 *
 * Shoutouts to Keijiro Takahashi
 */
export class CDS {
  public factor = 100.0;
  public ratio = 1.0;
  public velocity = 0.0;
  public value = 0.0;
  public target = 0.0;

  public update( deltaTime: number ): number {
    this.velocity += (
      -this.factor * ( this.value - this.target )
      - 2.0 * this.velocity * Math.sqrt( this.factor ) * this.ratio
    ) * deltaTime;
    this.value += this.velocity * deltaTime;
    return this.value;
  }
}
