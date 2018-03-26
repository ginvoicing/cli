import * as util from 'util';

import chalk from 'chalk';
import * as lodash from 'lodash';

import { CommandLineInputs, CommandLineOptions, CommandMetadata, PROJECT_FILE } from '@ionic/cli-utils';
import { Command } from '@ionic/cli-utils/lib/command';

export class ConfigGetCommand extends Command {
  async getMetadata(): Promise<CommandMetadata> {
    return {
      name: 'get',
      type: 'global',
      summary: 'Print config values',
      description: `
By default, this command prints properties in your project's ${chalk.bold(PROJECT_FILE)} file.

The CLI prints properties in the CLI config file (${chalk.bold(process.env.IONIC_CONFIG_DIRECTORY + '/config.json')}).

For nested properties, separate nest levels with dots. For example, the property name ${chalk.green('user.email')} will look in the ${chalk.bold('user')} object (a root-level field in the global CLI config file) for the ${chalk.bold('email')} field.

Without a ${chalk.green('property')} argument, this command prints out the entire file contents.

If you are using this command programmatically, you can use the ${chalk.green('--json')} option.

This command attempts to sanitize config output for known sensitive fields, such as fields within the ${chalk.bold('tokens')} object in the global CLI config file. This functionality is disabled when using ${chalk.green('--json')}.
      `,
      inputs: [
        {
          name: 'property',
          summary: 'The property name you wish to get',
        },
      ],
      options: [
        {
          name: 'json',
          summary: 'Output config values in JSON',
          type: Boolean,
          aliases: ['j'],
        },
      ],
      exampleCommands: ['', 'app_id'],
    };
  }

  async run(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void> {
    const [ p ] = inputs;
    const { json } = options;

    const file = this.env.config;

    const config = await file.load();
    const v = lodash.cloneDeep(p ? lodash.get(config, p) : config);

    if (json) {
      process.stdout.write(JSON.stringify(v));
    } else {
      this.sanitize(p, v);
      this.env.log.rawmsg(util.inspect(v, { colors: chalk.enabled }));
    }
  }

  scrubTokens(obj: any) {
    return lodash.mapValues(obj, () => '*****');
  }

  sanitize(key: string, obj: any) {
    if (typeof obj === 'object' && 'tokens' in obj) {
      obj['tokens'] = this.scrubTokens(obj['tokens']);
    }

    if (key === 'tokens') {
      lodash.assign(obj, this.scrubTokens(obj));
    }
  }
}
