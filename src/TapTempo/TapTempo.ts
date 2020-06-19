import { HistoryMeanCalculator } from '../HistoryMeanCalculator/HistoryMeanCalculator';

export class TapTempo {
  private __bpm = 0.0;
  private __lastTap = 0.0;
  private __lastBeat = 0.0;
  private __lastTime = 0.0;
  private __calc: HistoryMeanCalculator = new HistoryMeanCalculator( 16 );

  public get beatDuration(): number {
    return 60.0 / this.__bpm;
  }

  public get bpm(): number {
    return this.__bpm;
  }

  public set bpm( bpm: number ) {
    this.__lastBeat = this.beat;
    this.__lastTime = performance.now();
    this.__bpm = bpm;
  }

  public get beat(): number {
    return this.__lastBeat + ( performance.now() - this.__lastTime ) * 0.001 / this.beatDuration;
  }

  public reset(): void {
    this.__calc.reset();
  }

  public nudge( amount: number ): void {
    this.__lastBeat = this.beat + amount;
    this.__lastTime = performance.now();
  }

  public tap(): void {
    const now = performance.now();
    const delta = ( now - this.__lastTap ) * 0.001;

    if ( 2.0 < delta ) {
      this.reset();
    } else {
      this.__calc.push( delta );
      this.__bpm = 60.0 / ( this.__calc.mean );
    }

    this.__lastTap = now;
    this.__lastTime = now;
    this.__lastBeat = 0.0;
  }
}
