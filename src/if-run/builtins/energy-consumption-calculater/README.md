# Enegy Consumption Calculater

`enegy-consumption-calculater` is a generic plugin for calculating enegy consumption (kWh) from wattage and duration.

You provide the wattage value and the duration.

For example, you could add `wattage` and `duration`. The `energy-consumption` would then be added to every observation in your input array as the calculated value of `wattage` and `duration`.

## Parameters

### Plugin config

Three parameters are required in config: `input-parameter`, `duration` and `output-parameter`.

- `input-parameter`: a string matching an existing key in the `inputs` array.
- `duration`: the value to calculate `energy-consumption`.
- `output-parameter`: a string defining the name to use to add the result of the calculation of the input parameters to the output array.

### Plugin parameter metadata

The `parameter-metadata` section contains information about `description`, `unit` and `aggregation-method`
of the parameters of the inputs and outputs

- `inputs`: describe parameters of the `input-parameter` of the config. Each parameter has:

  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method object of the parameter
    - `time`: this value is used for `horizontal` aggregation. It can be of the following values: `sum`, `avg`, `copy`, or `none`.
    - `component`: this value is used for `vertical` aggregation. It can be of the following values: `sum`, `avg`, `copy`, or `none`.

- `outputs`: describe parameters of the `output-parameter` of the config. Each parameter has:
  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method object of the parameter
    - `time`: this value is used for `horizontal` aggregation. It can be of the following values: `sum`, `avg`, `copy`, or `none`.
    - `component`: this value is used for `vertical` aggregation. It can be of the following values: `sum`, `avg`, `copy`, or `none`.

### Mapping

The `mapping` block is an optional block. It is added in the plugin section and allows the plugin to receive a parameter from the input with a different name than the one the plugin uses for data manipulation. The parameter with the mapped name will not appear in the outputs. It also maps the output parameter of the plugin. The structure of the `mapping` block is:

```yaml
coenegy-consumption-calculater:
  method: CalculateEnergyConsumption
  path: 'builtin'
  mapping:
    'parameter-name-in-the-plugin': 'parameter-name-in-the-input'
```

### Inputs

All of `input-parameters` must be available in the input array.

## Returns

- `output-parameter`: the calculated value of the `input-parameters` with the parameter name defined by `output-parameter` in config.

## Calculation

```pseudocode
output = input-parameter * duration / 3600 / 1000
```

## Implementation

To run the plugin from a Typescript app, you must first create an instance of `CalculateEnergyConsumption`. Then, you can call `execute()`.

```typescript
const config = {
  'input-parameter': 'wattage',
  'output-parameter': 'energy-consumption',
};
const parametersMetadata = {inputs: {}, outputs: {}};
const mapping = {};

const calculateEnergyConsumption = CalculateEnergyConsumption(
  config,
  parametersMetadata,
  mapping
);
const result = await calculateEnergyConsumption.execute([
  {
    duration: 3600,
    timestamp: '2021-01-01T00:00:00Z',
    wattage: 3,
  },
]);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by `if-run` and does not have to be done explicitly by the user. The following is an example manifest that calls `enegy-consumption-calculater`:

```yaml
name: enegy-consumption-calculater-demo
description:
tags:
initialize:
  plugins:
    enegy-consumption-calculater:
      method: CalculateEnergyConsumption
      path: 'builtin'
      config:
        input-parameter: 'wattage'
        output-parameter: 'energy-consumption'

tree:
  children:
    child:
      pipeline:
        compute:
          - enegy-consumption-calculater
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          watt: 3
```

You can run this example by saving it as `./examples/manifests/enegy-consumption-calculater.yml` and executing the following command from the project root:

```sh
if-run --manifest ./examples/manifests/enegy-consumption-calculater.yml --output ./examples/outputs/enegy-consumption-calculater
```

The results will be saved to a new `yaml` file in `./examples/outputs`

## Errors

`enegy-consumption-calculater` exposes one of the IF error classes.

### ConfigError

You will receive an error starting `ConfigError: ` if you have not provided the expected configuration data in the plugin's `initialize` block.

The required parameters are:

- `input-parameter`: this must be a string
- `duration`: this must be a number
- `output-parameter`: this must be a string

You can fix this error by checking you are providing valid values for each parameter in the config.

### `MissingInputDataError`

This error arises when a necessary piece of input data is missing from the `inputs` array.
Every element in the ``inputs` array must contain:

- `timestamp`
- `duration`
- whatever value you passed to `input-parameter`

For more information on our error classes, please visit [our docs](https://if.greensoftware.foundation/reference/errors
