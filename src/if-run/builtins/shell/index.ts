import {spawnSync, SpawnSyncReturns} from 'child_process';

import {loadAll, dump} from 'js-yaml';
import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  ExecutePlugin,
  PluginParams,
  ConfigParams,
  MappingParams,
  PluginParametersMetadata,
} from '@grnsft/if-core/types';

import {PluginSettings} from '../../../common/types/manifest';
import {validate} from '../../../common/util/validations';
import {mapOutput} from '../../../common/util/helpers';

const {ProcessExecutionError} = ERRORS;

export const Shell = (options: PluginSettings): ExecutePlugin => {
  const {
    'global-config': globalConfig,
    'parameter-metadata': parametersMetadata,
    mapping,
  } = options as {
    'global-config': ConfigParams;
    'parameter-metadata': PluginParametersMetadata;
    mapping: MappingParams;
  };
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
  };

  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = (inputs: PluginParams[]): any[] => {
    const inputWithConfig = Object.assign({}, inputs[0], validateConfig());
    const command = inputWithConfig.command;
    const inputAsString: string = dump(inputs, {indent: 2});
    const results = runModelInShell(inputAsString, command);
    const outputs = results?.outputs?.flat() as PluginParams[];

    return outputs.map(output => mapOutput(output, mapping));
  };

  /**
   * Checks for required fields in input.
   */
  const validateConfig = () => {
    const schema = z.object({
      command: z.string(),
    });

    return validate<z.infer<typeof schema>>(schema, globalConfig);
  };

  /**
   * Runs the model in a shell. Spawns a child process to run an external IMP,
   * an executable with a CLI exposing two methods: `--execute` and `--manifest`.
   * The shell command then calls the `--command` method passing var manifest as the path to the desired manifest file.
   */
  const runModelInShell = (input: string, command: string) => {
    try {
      const [executable, ...args] = command.split(' ');

      const result: SpawnSyncReturns<string> = spawnSync(executable, args, {
        input,
        encoding: 'utf8',
      });
      const outputs = loadAll(result.stdout);

      return {outputs};
    } catch (error: any) {
      throw new ProcessExecutionError(error.message);
    }
  };

  return {
    metadata,
    execute,
  };
};
