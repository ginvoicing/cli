import * as path from 'path';

import chalk from 'chalk';

import { contains, validators } from '@ionic/cli-framework';
import { BaseError } from '@ionic/cli-framework/lib/errors';
import { CommandLineInputs, CommandLineOptions, CommandMetadata, isIntegrationName } from '@ionic/cli-utils';
import { Command } from '@ionic/cli-utils/lib/command';
import { FatalException } from '@ionic/cli-utils/lib/errors';
import { BaseIntegration, INTEGRATION_NAMES } from '@ionic/cli-utils/lib/integrations';

export class IntegrationsEnableCommand extends Command {
  async getMetadata(): Promise<CommandMetadata> {
    return {
      name: 'enable',
      type: 'project',
      summary: 'Add various integrations to your app',
      inputs: [
        {
          name: 'name',
          summary: `The integration to enable (${INTEGRATION_NAMES.map(i => chalk.green(i)).join(', ')})`,
          validators: [validators.required, contains(INTEGRATION_NAMES, {})],
        },
      ],
      options: [
        {
          name: 'quiet',
          summary: 'Do not log file operations',
          type: Boolean,
        },
      ],
    };
  }

  async run(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void> {
    const [ name ] = inputs;
    const { quiet } = options;

    if (!isIntegrationName(name)) {
      throw new FatalException(`Don't know about ${chalk.green(name)} integration!`);
    }

    const integration = await BaseIntegration.createFromName(this.env, name);
    const integrationConfig = await integration.getConfig();

    try {
      if (integrationConfig) {
        const wasEnabled = integrationConfig.enabled !== false;

        // We still need to run this whenever this command is run to make sure
        // everything is good with the integration.
        await integration.enable();

        if (wasEnabled) {
          this.env.log.info(`Integration ${chalk.green(integration.name)} enabled.`);
        } else {
          this.env.log.ok(`Integration ${chalk.green(integration.name)} enabled!`);
        }
      } else { // never been added to project
        await integration.add({
          conflictHandler: async (f, stats) => {
            const isDirectory = stats.isDirectory();
            const filename = `${path.basename(f)}${isDirectory ? '/' : ''}`;
            const type = isDirectory ? 'directory' : 'file';

            const confirm = await this.env.prompt({
              type: 'confirm',
              name: 'confirm',
              message: `The ${chalk.cyan(filename)} ${type} exists in project. Overwrite?`,
              default: false,
            });

            return confirm;
          },
          onFileCreate: f => {
            if (!quiet) {
              this.env.log.msg(`  ${chalk.green('create')} ${f}`);
            }
          },
        });

        this.env.log.ok(`Integration ${chalk.green(integration.name)} added!`);
      }
    } catch (e) {
      if (e instanceof BaseError) {
        throw new FatalException(e.message);
      }

      throw e;
    }

    await this.env.project.save();
  }
}
