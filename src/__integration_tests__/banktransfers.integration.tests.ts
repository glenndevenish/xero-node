import { AccountingAPIClient } from '../AccountingAPIClient';
import { getOrCreateAccountId, getOrCreateBankTransferId } from './helpers/entityId.helpers';
import { getPrivateConfig, setJestTimeout } from './helpers/integration.helpers';

describe('/banktransfers', () => {
	let xero: AccountingAPIClient;

	beforeAll(async () => {
		setJestTimeout();
		const config = getPrivateConfig('1');
		xero = new AccountingAPIClient(config);
	});

	it('can get all', async () => {
		const response = await xero.bankTransfers.get();
		expect(response.BankTransfers).toBeDefined();
	});

	it('can get single', async () => {
		const bankTransferId = await getOrCreateBankTransferId(xero);

		const response = await xero.bankTransfers.get({ BankTransferID: bankTransferId });
		expect(response.BankTransfers[0].Amount).toBeDefined();
	});

	// it('can get history', async () => {
	// 	const bankTransferId = await getOrCreateBankTransferId(xero);

	// 	const response = await xero.bankTransfers.history.get({ BankTransferID: bankTransferId });
	// 	expect(response.HistoryRecords[0]).toBeDefined();
	// });

	it('create', async () => {
		const fromAccountId = await getOrCreateAccountId(xero, { where: 'Type=="BANK"' });
		const toAccountId = await getOrCreateAccountId(xero, { where: `Type=="BANK"&&AccountID!=GUID("${fromAccountId}")` });

		const response = await xero.bankTransfers.create({
			FromBankAccount: { AccountID: fromAccountId },
			ToBankAccount: { AccountID: toAccountId },
			Amount: 0.75
		});

		expect(response.BankTransfers.length).toBe(1);
		expect(response.BankTransfers[0].Amount).toEqual(0.75);
	});
});
