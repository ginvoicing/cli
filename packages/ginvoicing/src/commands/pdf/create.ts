import chalk from 'chalk';
import * as puppeteer from 'puppeteer';

import { validators } from '@ionic/cli-framework';

import { CommandLineInputs, CommandLineOptions, CommandMetadata, PROJECT_FILE } from '@ionic/cli-utils';
import { Command } from '@ionic/cli-utils/lib/command';

export class PDFCreateCommand extends Command {
  async getMetadata(): Promise<CommandMetadata> {
    return {
      name: 'create',
      type: 'global',
      summary: 'It will create PDF from given URL.',
      description: `
By default, this command sets JSON properties in your project's ${chalk.bold(PROJECT_FILE)} file.
      `,
      inputs: [
        {
          name: 'url',
          summary: 'The property url has to be a valid url with (http:// https://)',
          validators: [validators.required],
        },
      ],
      options: [
      ],
      exampleCommands: ['url newAppName', 'url "\\"newAppName\\"" --json'],
    };
  }

  async run(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void> {
    const [ url ] = inputs;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: ['load', 'domcontentloaded']});
    await page.emulateMedia('screen');
    await page.pdf({path: 'output.pdf', format: 'A4'});
    await browser.close();
  }
}
