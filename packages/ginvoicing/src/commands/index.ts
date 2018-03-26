import { CommandMap, Namespace, NamespaceMap } from '@ionic/cli-utils/lib/namespace';

export class GinvoicingNamespace extends Namespace {
  async getMetadata() {
    return {
      name: 'gi',
      summary: '',
    };
  }

  async getNamespaces(): Promise<NamespaceMap> {
    return new NamespaceMap([
      ['config', async () => { const { ConfigNamespace } = await import('./config/index'); return new ConfigNamespace(this, this.env); }],
      ['pdf', async () => { const { PDFNamespace } = await import('./pdf/index'); return new PDFNamespace(this, this.env); }],
    ]);
  }

  async getCommands(): Promise<CommandMap> {
    return new CommandMap([
      ['docs', async () => { const { DocsCommand } = await import('./docs'); return new DocsCommand(this, this.env); }],
      ['help', async () => { const { HelpCommand } = await import('./help'); return new HelpCommand(this, this.env); }],
      ['info', async () => { const { InfoCommand } = await import('./info'); return new InfoCommand(this, this.env); }],
      ['version', async () => { const { VersionCommand } = await import('./version'); return new VersionCommand(this, this.env); }],
    ]);
  }
}
