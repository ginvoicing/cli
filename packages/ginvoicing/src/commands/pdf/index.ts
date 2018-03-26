import { CommandMap, Namespace } from '@ionic/cli-utils/lib/namespace';

export class PDFNamespace extends Namespace {
  async getMetadata() {
    return {
      name: 'pdf',
      summary: 'Help to create pdf',
      description: `
These commands are used to programmatically read, write, and delete CLI and project config values.
      `,
    };
  }

  async getCommands(): Promise<CommandMap> {
    return new CommandMap([
      ['create', async () => { const { PDFCreateCommand } = await import('./create'); return new PDFCreateCommand(this, this.env); }],
    ]);
  }
}
