import { HistoryPercentileCalculator } from './HistoryPercentileCalculator';

/**
 * @deprecated It's actually just a special case of {@link HistoryPercentileCalculator}
 */
export class HistoryMedianCalculator extends HistoryPercentileCalculator {
  public constructor( length: number ) {
    super( length );
    console.warn( 'HistoryMedianCalculator: Deprecated. Use HistoryPercentileCalculator instead' );
  }
}
