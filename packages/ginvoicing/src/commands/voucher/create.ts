import chalk from 'chalk';
import * as lodash from 'lodash';

import { validators } from '@ionic/cli-framework';
import { prettyPath } from '@ionic/cli-framework/utils/format';

import { CommandLineInputs, CommandLineOptions, CommandMetadata, IBaseConfig, PROJECT_FILE } from '@ionic/cli-utils';
import { Command } from '@ionic/cli-utils/lib/command';
import { FatalException } from '@ionic/cli-utils/lib/errors';

export class VoucherCreateCommand extends Command {
  async getMetadata(): Promise<CommandMetadata> {
    return {
      name: 'create',
      type: 'global',
      summary: 'It will return json calculated invoice',
      description: `
By default, this command sets JSON properties in your project's ${chalk.bold(PROJECT_FILE)} file.
      `,
      inputs: [
        {
          name: 'voucher',
          summary: 'Valid JSON object of Voucher.',
          validators: [validators.required],
        },
      ],
      options: [
        {
          name: 'json',
          summary: `Always interpret ${chalk.green('value')} as JSON`,
          type: Boolean,
          aliases: ['j'],
        },
      ],
      exampleCommands: ['name newAppName', 'name "\\"newAppName\\"" --json'],
    };
  }

  async run(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void> {
    const [ p ] = inputs;
    let [ , v ] = inputs;

    const { json, force } = options;

    const file: IBaseConfig<object> = this.env.config;

    const config = await file.load();
    const oldValue = lodash.get(config, p);

    if (!v.match(/^\d+e\d+$/)) {
      try {
        v = JSON.parse(v);
      } catch (e) {
        if (!(e instanceof SyntaxError)) {
          throw e;
        }

        if (json) {
          throw new FatalException(`${chalk.green('--json')}: ${chalk.green(v)} is invalid JSON: ${chalk.red(String(e))}`);
        }
      }
    }

    const newValue = v;

    if (oldValue && typeof oldValue === 'object' && !force) {
      throw new FatalException(
        `Sorry--will not override objects or arrays without ${chalk.green('--force')}.\n` +
        `Value of ${chalk.green(p)} is: ${chalk.bold(JSON.stringify(oldValue))}`
      );
    }

    const valueChanged = oldValue !== newValue;

    lodash.set(config, p, newValue);
    await file.save();

    if (valueChanged) {
      this.env.log.ok(`${chalk.green(p)} set to ${chalk.green(JSON.stringify(v))} in ${chalk.bold(prettyPath(file.filePath))}!`);
    } else {
      this.env.log.msg(`${chalk.green(p)} is already set to ${chalk.bold(JSON.stringify(v))}.`);
    }
  }
}
