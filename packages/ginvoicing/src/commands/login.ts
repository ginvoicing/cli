import chalk from 'chalk';

import { validators } from '@ionic/cli-framework';
import { CommandInstanceInfo, CommandLineInputs, CommandLineOptions, CommandMetadata, CommandPreRun, OptionGroup } from '@ionic/cli-utils';
import { Command } from '@ionic/cli-utils/lib/command';
import { runCommand } from '@ionic/cli-utils/lib/executor';
import { generateUUID } from '@ionic/cli-utils/lib/utils/uuid';

export class LoginCommand extends Command implements CommandPreRun {
  async getMetadata(): Promise<CommandMetadata> {
    return {
      name: 'login',
      type: 'global',
      summary: 'Login to Ionic Pro',
      description: `
Authenticate with Ionic Pro and retrieve a user token, which is stored in the CLI config.

Alternatively, set the ${chalk.green('IONIC_TOKEN')} environment variable and the CLI will automatically authenticate you. (You can also use ${chalk.green('IONIC_EMAIL')} and ${chalk.green('IONIC_PASSWORD')}.)

If you need to create an Ionic Pro account, use ${chalk.green('ionic signup')}.
      `,
      exampleCommands: ['', 'john@example.com', 'hello@example.com secret'],
      inputs: [
        {
          name: 'email',
          summary: 'Your email address',
          validators: [validators.required, validators.email],
          private: true,
        },
        {
          name: 'password',
          summary: 'Your password',
          validators: [validators.required],
          private: true,
        },
      ],
      options: [
        {
          name: 'email',
          summary: '',
          private: true,
          groups: [OptionGroup.Hidden],
        },
        {
          name: 'password',
          summary: '',
          private: true,
          groups: [OptionGroup.Hidden],
        },
      ],
    };
  }

  async preRun(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void> {
    const [ email ] = inputs;

    const config = await this.env.config.load();

    if (await this.env.session.isLoggedIn()) {
      const extra = !inputs[0] || !inputs[1] ? 'Prompting for new credentials.' : 'Attempting login.';
      this.env.log.warn(`You are already logged in${config.user.email ? ' as ' + chalk.bold(config.user.email) : ''}! ${this.env.flags.interactive ? extra : ''}`);
    } else {
      this.env.log.msg(
        `Log into your Ionic Pro account\n` +
        `If you don't have one yet, create yours by running: ${chalk.green(`ionic signup`)}\n`
      );
    }

    if (options['email'] || options['password']) {
      const extra = this.env.flags.interactive ? 'You will be prompted to provide credentials. Alternatively, you can try this:' : 'Try this:';
      this.env.log.warn(
        `${chalk.green('email')} and ${chalk.green('password')} are command arguments, not options. ${extra}\n` +
        `${chalk.green('ionic login ' + (options['email'] ? options['email'] : email) + ' *****')}\n`
      );
    }

    // TODO: combine with promptToLogin ?

    if (!inputs[0]) {
      const email = await this.env.prompt({
        type: 'input',
        name: 'email',
        message: 'Email:',
        default: options['email'],
        validate: v => validators.required(v) && validators.email(v),
      });

      inputs[0] = email;
    }

    if (!inputs[1]) {
      const password = await this.env.prompt({
        type: 'password',
        name: 'password',
        message: 'Password:',
        mask: '*',
        validate: v => validators.required(v),
      });

      inputs[1] = password;
    }
  }

  async run(inputs: CommandLineInputs, options: CommandLineOptions, runinfo: CommandInstanceInfo): Promise<void> {
    const [ email, password ] = inputs;

    const config = await this.env.config.load();

    if (await this.env.session.isLoggedIn()) {
      this.env.log.msg('Logging you out.');
      await runCommand(runinfo, ['logout']);
      config.tokens.telemetry = generateUUID();
    }

    await this.env.session.login(email, password);

    this.env.log.ok('You are logged in!');
  }
}
