import { CommandMap, Namespace } from '@ionic/cli-utils/lib/namespace';

export class VoucherNamespace extends Namespace {
  async getMetadata() {
    return {
      name: 'voucher',
      summary: 'Help to create voucher',
      description: `
These commands are used to programmatically read, write, and delete CLI and project config values.
      `,
    };
  }

  async getCommands(): Promise<CommandMap> {
    return new CommandMap([
      ['create', async () => { const { VoucherCreateCommand } = await import('./create'); return new VoucherCreateCommand(this, this.env); }],
    ]);
  }
}
