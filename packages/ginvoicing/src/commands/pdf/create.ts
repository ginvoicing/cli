import chalk from 'chalk';
import * as puppeteer from 'puppeteer';

import { validators } from '@ionic/cli-framework';

import { CommandLineInputs, CommandLineOptions, CommandMetadata, OptionGroup, PROJECT_FILE } from '@ionic/cli-utils';
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
          validators: [validators.required, validators.url],
        },
      ],
      options: [
        {
          name: 'format',
          summary: 'Provide format you are interested in. Letter, Legal, Tabloid, Ledger, A0, A1, A2, A3, A4, A5, A6',
          default: 'A4',
          type: String,
          aliases: ['f'],
          groups: [OptionGroup.Advanced],
        },
        {
          name: 'width',
          summary: 'Width of pdf file.',
          type: String,
          aliases: ['w'],
          groups: [OptionGroup.Advanced],
        },
        {
          name: 'height',
          summary: 'Height of pdf file',
          type: String,
          aliases: ['h'],
          groups: [OptionGroup.Advanced],
        },
        {
          name: 'out',
          summary: 'Name of the file to get output in.',
          type: String,
          aliases: ['o'],
          groups: [OptionGroup.Advanced],
        },
        {
          name: 'layout',
          summary: 'Layout of page to be printed. landscape or portrait. Default is portrait',
          type: String,
          default: 'portrait',
          aliases: ['l'],
          groups: [OptionGroup.Advanced],
        },
      ],
      exampleCommands: ['url newAppName', 'url "\\"newAppName\\"" --json'],
    };
  }

  async run(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void> {
    const url = inputs[0];
    const format = (options['width'] && options['height']) ? {height: options['height'], width: options['width']} : {format: options['format']};
    const output = options['out'] ? {path: options['out']} : {path: 'output.pdf'};
    const layout = (options['layout'] && options['layout'] === 'portrait') ? {landscape: false} : {landscape: true};
    const opts = {
      printBackground: true,
    };
    Object.assign(opts, format, output, layout);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.emulateMedia('screen');
    await page.pdf(opts);
    await browser.close();
  }
}
