import {z} from 'zod';

import {ERRORS} from '@grnsft/if-core/utils';
import {ConfigParams, PluginParams} from '@grnsft/if-core/types';
import {PluginFactory} from '@grnsft/if-core/interfaces';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const CalculateEnergyConsumption = PluginFactory({
  configValidation: (config: ConfigParams) => {
    if (!config || !Object.keys(config)?.length) {
      throw new ConfigError(MISSING_CONFIG);
    }
    const schema = z.object({
      'input-parameter': z.string().min(1),
      'output-parameter': z.string().min(1),
    });
    return validate<z.infer<typeof schema>>(schema, config);
  },
  inputValidation: (input: PluginParams, config: ConfigParams) => {
    const {'input-parameter': inputParameter} = config;
    const schema = z.object({
      [inputParameter]: z.number(),
      duration: z.number(),
    });
    return validate<z.infer<typeof schema>>(schema, input);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
    const outputParameter = config['output-parameter'];

    return inputs.map(input => ({
      ...input,
      [outputParameter]: computeEnergyUsage(input, config),
    }));
  },
  allowArithmeticExpressions: ['input-parameter'],
});

/**
 * Calculates the enegy consumption from the wattage and the duration.
 */
const computeEnergyUsage = (input: PluginParams, config: ConfigParams) => {
  const {'input-parameter': inputParameter} = config;
  const finalwattage =
    typeof inputParameter === 'number' ? inputParameter : input[inputParameter];
  const finalDuration = input.duration;

  return (finalDuration / 3600) * (finalwattage / 1000);
};
