import {ERRORS} from '../util/errors';
import {parameterize} from '../lib/parameterize';

import {STRINGS} from '../config';

import {AggregationResult} from '../types/aggregation';
import {PluginParams} from '../types/interface';

const {InvalidAggregationParams} = ERRORS;
const {INVALID_AGGREGATION_METHOD, METRIC_MISSING} = STRINGS;

/**
 * Validates metrics array before applying aggregator.
 * If aggregation method is `none`, then throws error.
 */
const checkIfMetricsAreValid = (metrics: string[]) => {
  metrics.forEach(metric => {
    const method = parameterize.getAggregationMethod(metric);

    if (method === 'none') {
      throw new InvalidAggregationParams(INVALID_AGGREGATION_METHOD(method));
    }
  });
};

/**
 * Aggregates child node level metrics. Validates if metric aggregation type is `none`, then rejects with error.
 * Otherwise iterates over inputs by aggregating per given `metrics`.
 */
export const aggregateInputsIntoOne = (
  inputs: PluginParams[],
  metrics: string[]
) => {
  checkIfMetricsAreValid(metrics);

  return inputs.reduce((acc, input, index) => {
    for (const metric of metrics) {
      if (!(metric in input)) {
        throw new InvalidAggregationParams(METRIC_MISSING(metric, index));
      }

      acc[metric] = acc[metric] ?? 0;
      acc[metric] += parseFloat(input[metric]);

      /** Checks for the last iteration. */
      if (index === inputs.length - 1) {
        if (parameterize.getAggregationMethod(metric) === 'avg') {
          acc[metric] /= inputs.length;
        }
      }
    }

    return acc;
  }, {} as AggregationResult);
};