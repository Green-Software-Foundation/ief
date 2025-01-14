import {ERRORS} from '@grnsft/if-core/utils';

import {CalculateEnergyConsumption} from '../../../if-run/builtins/energy-consumption-calculater';

import {STRINGS} from '../../../if-run/config';

const {InputValidationError, ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

describe('builtins/energy-consumption-calculater: ', () => {
  describe('CalculateEnergyConsumption: ', () => {
    const config = {
      'input-parameter': 'wattage',
      'output-parameter': 'energy-consumption',
    };
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    const calculateEnergyConsumption = CalculateEnergyConsumption(
      config,
      parametersMetadata,
      {}
    );

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(calculateEnergyConsumption).toHaveProperty('metadata');
        expect(calculateEnergyConsumption).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies CalculateEnergyConsumption strategy to given input.', async () => {
        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            wattage: 100,
            'energy-consumption': 0.1,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await calculateEnergyConsumption.execute([
          {
            duration: 3600,
            wattage: 100,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when `mapping` has valid data.', async () => {
        expect.assertions(1);
        const mapping = {
          wattage: 'watts',
        };

        const calculateEnergyConsumption = CalculateEnergyConsumption(
          config,
          parametersMetadata,
          mapping
        );

        const expectedResult = [
          {
            duration: 3600,
            watts: 100,
            'energy-consumption': 0.1,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await calculateEnergyConsumption.execute([
          {
            duration: 3600,
            watts: 100,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when the `mapping` map output parameter.', async () => {
        expect.assertions(1);
        const mapping = {
          'energy-consumption': 'power-consumption',
        };

        const calculateEnergyConsumption = CalculateEnergyConsumption(
          config,
          parametersMetadata,
          mapping
        );

        const expectedResult = [
          {
            duration: 3600,
            wattage: 100,
            'power-consumption': 0.1,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await calculateEnergyConsumption.execute([
          {
            duration: 3600,
            wattage: 100,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when a parameter contains arithmetic expression.', async () => {
        expect.assertions(1);

        const config = {
          'input-parameter': "=3*'wattage'",
          'output-parameter': 'energy-consumption',
        };

        const calculateEnergyConsumption = CalculateEnergyConsumption(
          config,
          parametersMetadata,
          {}
        );
        const input = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            wattage: 100,
          },
        ];
        const result = await calculateEnergyConsumption.execute(input);

        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            wattage: 100,
            'energy-consumption': 0.3,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws an error the `input-parameter` parameter has wrong arithmetic expression.', async () => {
        const config = {
          'input-parameter': '3*"wattage"',
          'output-parameter': 'energy-consumption',
        };

        const calculateEnergyConsumption = CalculateEnergyConsumption(
          config,
          parametersMetadata,
          {}
        );
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            wattage: 100,
          },
        ];
        expect.assertions(2);
        try {
          await calculateEnergyConsumption.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect(error).toEqual(
            new InputValidationError(
              'The `input-parameter` contains an invalid arithmetic expression. It should start with `=` and include the symbols `*`, `+`, `-` and `/`.'
            )
          );
        }
      });

      it('throws an error on missing params in input.', async () => {
        const expectedMessage =
          '"wattage" parameter is required. Error code: invalid_type.';

        const config = {
          'input-parameter': 'wattage',
          duration: 3600,
          'output-parameter': 'energy-consumption',
        };

        const calculateEnergyConsumption = CalculateEnergyConsumption(
          config,
          parametersMetadata,
          {}
        );

        expect.assertions(1);

        try {
          await calculateEnergyConsumption.execute([
            {
              timestamp: '2021-01-01T00:00:00Z',
              duration: 3600,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(expectedMessage)
          );
        }
      });
    });

    it('throws an error on missing config.', async () => {
      const config = undefined;
      const calculateEnergyConsumption = CalculateEnergyConsumption(
        config!,
        parametersMetadata,
        {}
      );

      expect.assertions(1);

      try {
        await calculateEnergyConsumption.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
          },
        ]);
      } catch (error) {
        expect(error).toStrictEqual(new ConfigError(MISSING_CONFIG));
      }
    });
  });
});
