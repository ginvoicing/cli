import * as tls from 'tls';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';

import chalk from 'chalk';
import * as express from 'express';

import {
  Command,
  CommandLineInputs,
  CommandLineOptions,
  CommandMap,
  CommandMapDefault,
  Namespace,
  execute,
  validators,
} from '@ionic/cli-framework';

import { fsReadFile } from '@ionic/cli-framework/utils/fs';

class DefaultCommand extends Command {
  async getMetadata() {
    return {
      name: 'default',
      description: '',
      inputs: [
        {
          name: 'url',
          description: 'The URL of the livereload server to use with lab',
          validators: [validators.required, validators.url],
        },
      ],
      options: [
        {
          name: 'host',
          description: 'HTTP host of Ionic Lab',
          default: 'localhost',
        },
        {
          name: 'port',
          description: 'HTTP port of Ionic Lab',
          default: '8200',
        },
        {
          name: 'ssl',
          description: 'Host Ionic Lab with HTTPS',
          type: Boolean,
        },
        {
          name: 'ssl-key',
          description: 'Path to SSL key',
        },
        {
          name: 'ssl-cert',
          description: 'Path to SSL certificate',
        },
        {
          name: 'app-name',
          description: 'App name to show in bottom left corner',
        },
        {
          name: 'app-version',
          description: 'App version to show in bottom left corner',
        },
      ],
    };
  }

  async run(inputs: CommandLineInputs, options: CommandLineOptions) {
    const [ url ] = inputs;
    const { host, port, ssl } = options;
    const protocol = ssl ? 'https' : 'http';

    const name = options['app-name'];
    const version = options['app-version'];

    const app = express();

    app.use('/', express.static(path.join(__dirname, '..', 'www')));

    app.get('/api/app', (req, res) => {
      res.json({ url, name, version });
    });

    const server = ssl ? https.createServer(await this.collectSecureContextOptions(options), app) : http.createServer(app);
    server.listen({ port, host });

    const labUrl = `${protocol}://${host}:${port}`;

    server.on('listening', () => {
      process.stdout.write(
        'Ionic Lab running!\n' +
        `Lab: ${chalk.bold(labUrl)}\n` +
        `App: ${chalk.bold(url)}\n`
      );
    });
  }

  async collectSecureContextOptions(options: CommandLineOptions): Promise<tls.SecureContextOptions> {
    const sslKeyPath = options['ssl-key'] ? String(options['ssl-key']) : undefined;
    const sslCertPath = options['ssl-cert'] ? String(options['ssl-cert']) : undefined;

    if (!sslKeyPath || !sslCertPath) {
      throw new Error('SSL key and cert required for serving SSL');
    }

    const [ key, cert ] = await Promise.all([this.readPem(sslKeyPath), this.readPem(sslCertPath)]);

    return { key, cert };
  }

  async readPem(p: string): Promise<string> {
    try {
      return await fsReadFile(p, { encoding: 'utf8' });
    } catch (e) {
      process.stderr.write(String(e.stack ? e.stack : e) + '\n');
      throw new Error(`Error encountered with ${p}`);
    }
  }
}

class LabNamespace extends Namespace {
  async getMetadata() {
    return {
      name: 'ionic-lab',
      description: '',
    };
  }

  async getCommands(): Promise<CommandMap> {
    return new CommandMap([[CommandMapDefault, async () => new DefaultCommand(this)]]);
  }
}

const ns = new LabNamespace();

export async function run(pargv: string[], env: { [k: string]: string; }) {
  await execute(ns, pargv, env);
}
