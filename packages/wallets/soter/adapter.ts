import {
	BaseMessageSignerWalletAdapter,
	EventEmitter,
	scopePollingDetectionStrategy,
	WalletConnectionError,
	WalletRequestViewKeyError,
	WalletDisconnectionError,
	WalletName,
	WalletNotConnectedError,
	WalletNotReadyError,
	WalletReadyState,
	WalletSignTransactionError,
	WalletDecryptionNotAllowedError,
	WalletDecryptionError,
	WalletRecordsError,
	DecryptPermission,
	WalletAdapterNetwork,
	AleoTransaction,
	AleoDeployment,
	WalletTransactionError,
} from "@aleo123/aleo-wallet-adapter-base";

export interface SoterWalletEvents {
	connect(...args: unknown[]): unknown;

	disconnect(...args: unknown[]): unknown;
}

export interface SoterWallet extends EventEmitter<SoterWalletEvents> {
	publicKey?: string;
	viewKey?: string;

	signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;

	// requestViewKey(): Promise<{ viewKey: string }>;

	decrypt(
		cipherText: string,
		tpk?: string,
		programId?: string,
		functionName?: string,
		index?: number
	): Promise<{ text: string }>;

	requestRecords(program: string): Promise<{ records: any[] }>;

	requestTransaction(transaction: AleoTransaction): Promise<{ transactionId?: string }>;

	requestExecution(transaction: AleoTransaction): Promise<{ transactionId?: string }>;

	requestBulkTransactions(transactions: AleoTransaction[]): Promise<{ transactionIds?: string[] }>;

	requestDeploy(deployment: AleoDeployment): Promise<{ transactionId?: string }>;

	transactionStatus(transactionId: string): Promise<{ status: string }>;

	getExecution(transactionId: string): Promise<{ execution: string }>;

	requestRecordPlaintexts(program: string): Promise<{ records: any[] }>;

	requestTransactionHistory(program: string): Promise<{ transactions: any[] }>;

	connect(decryptPermission: DecryptPermission, network: WalletAdapterNetwork): Promise<void>;

	disconnect(): Promise<void>;
}

export interface SoterWindow extends Window {
	soterWallet?: SoterWallet;
	soter?: SoterWallet;
}

declare const window: SoterWindow;

export interface SoterWalletAdapterConfig {
	appName?: string;
}

export const SoterWalletName = "Soter Wallet" as WalletName<"Soter Wallet">;

export class SoterWalletAdapter extends BaseMessageSignerWalletAdapter {
	name = SoterWalletName;
	url = "https://chrome.google.com/webstore/detail/soter-aleo-wallet/kfpmpkkjaohgchlokcohbaokindffdjk";
	icon = "https://doc.aleo123.io/icon.png";
	readonly supportedTransactionVersions = null;

	private _connecting: boolean;
	private _wallet: SoterWallet | null;
	private _publicKey: string | null;
	private _decryptPermission: string;
	private _viewKey: string | null;
	private _readyState: WalletReadyState =
		typeof window === "undefined" || typeof document === "undefined"
			? WalletReadyState.Unsupported
			: WalletReadyState.NotDetected;

	constructor({ appName = "sample" }: SoterWalletAdapterConfig = {}) {
		super();
		this._connecting = false;
		this._wallet = null;
		this._publicKey = null;
		this._decryptPermission = DecryptPermission.NoDecrypt;
		this._viewKey = null;

		if (this._readyState !== WalletReadyState.Unsupported) {
			scopePollingDetectionStrategy(() => {
				if (window?.soter || window?.soterWallet) {
					this._readyState = WalletReadyState.Installed;
					this.emit("readyStateChange", this._readyState);
					return true;
				}
				return false;
			});
		}
	}

	get publicKey() {
		return this._publicKey;
	}

	get viewKey() {
		return this._viewKey;
	}

	get decryptPermission() {
		return this._decryptPermission;
	}

	get connecting() {
		return this._connecting;
	}

	get readyState() {
		return this._readyState;
	}

	set readyState(readyState) {
		this._readyState = readyState;
	}

	async decrypt(cipherText: string, tpk?: string, programId?: string, functionName?: string, index?: number) {
		try {
			const wallet = this._wallet;
			if (!wallet || !this.publicKey) throw new WalletNotConnectedError();
			switch (this._decryptPermission) {
				case DecryptPermission.NoDecrypt:
					throw new WalletDecryptionNotAllowedError();

				case DecryptPermission.UponRequest:
				case DecryptPermission.AutoDecrypt:
				case DecryptPermission.ViewKeyAccess: {
					try {
						const text = await wallet.decrypt(cipherText, tpk, programId, functionName, index);
						return text.text;
					} catch (error: any) {
						throw new WalletDecryptionError(error?.message, error);
					}
				}
				default:
					throw new WalletDecryptionError();
			}
		} catch (error: any) {
			this.emit("error", error);
			throw error;
		}
	}

	async requestRecords(program: string): Promise<any[]> {
		try {
			const wallet = this._wallet;
			if (!wallet || !this.publicKey) throw new WalletNotConnectedError();

			try {
				const result = await wallet.requestRecords(program);
				return result.records;
			} catch (error: any) {
				throw new WalletRecordsError(error?.message, error);
			}
		} catch (error: any) {
			this.emit("error", error);
			throw error;
		}
	}

	async requestTransaction(transaction: AleoTransaction): Promise<string> {
		try {
			const wallet = this._wallet;
			if (!wallet || !this.publicKey) throw new WalletNotConnectedError();
			try {
				const result = await wallet.requestTransaction(transaction);
				return result.transactionId ? result.transactionId : "";
			} catch (error: any) {
				throw new WalletTransactionError(error?.message, error);
			}
		} catch (error: any) {
			this.emit("error", error);
			throw error;
		}
	}

	async requestExecution(transaction: AleoTransaction): Promise<string> {
		try {
			const wallet = this._wallet;
			if (!wallet || !this.publicKey) throw new WalletNotConnectedError();
			try {
				const result = await wallet.requestExecution(transaction);
				return result.transactionId;
			} catch (error: any) {
				throw new WalletTransactionError(error?.message, error);
			}
		} catch (error: any) {
			this.emit("error", error);
			throw error;
		}
	}

	async requestBulkTransactions(transactions: AleoTransaction[]): Promise<string[]> {
		try {
			const wallet = this._wallet;
			if (!wallet || !this.publicKey) throw new WalletNotConnectedError();
			try {
				const result = await wallet.requestBulkTransactions(transactions);
				return result.transactionIds ? result.transactionIds : [];
			} catch (error: any) {
				throw new WalletTransactionError(error?.message, error);
			}
		} catch (error: any) {
			this.emit("error", error);
			throw error;
		}
	}

	async requestDeploy(deployment: AleoDeployment): Promise<string> {
		try {
			const wallet = this._wallet;
			if (!wallet || !this.publicKey) throw new WalletNotConnectedError();
			try {
				const result = await wallet.requestDeploy(deployment);
				return result.transactionId ? result.transactionId : "";
			} catch (error: any) {
				throw new WalletTransactionError(error?.message, error);
			}
		} catch (error: any) {
			this.emit("error", error);
			throw error;
		}
	}

	async transactionStatus(transactionId: string): Promise<string> {
		try {
			const wallet = this._wallet;
			if (!wallet || !this.publicKey) throw new WalletNotConnectedError();
			try {
				const result = await wallet.transactionStatus(transactionId);
				return result.status ? result.status : "";
			} catch (error: any) {
				throw new WalletTransactionError(error?.message, error);
			}
		} catch (error: any) {
			this.emit("error", error);
			throw error;
		}
	}

	async getExecution(transactionId: string): Promise<string> {
		try {
			const wallet = this._wallet;
			if (!wallet || !this.publicKey) throw new WalletNotConnectedError();
			try {
				const result = await wallet.getExecution(transactionId);
				return result.execution;
			} catch (error: any) {
				throw new WalletTransactionError(error?.message, error);
			}
		} catch (error: any) {
			this.emit("error", error);
			throw error;
		}
	}

	async requestRecordPlaintexts(program: string): Promise<any[]> {
		try {
			const wallet = this._wallet;
			if (!wallet || !this.publicKey) throw new WalletNotConnectedError();

			try {
				const result = await wallet.requestRecordPlaintexts(program);
				return result.records;
			} catch (error: any) {
				throw new WalletRecordsError(error?.message, error);
			}
		} catch (error: any) {
			this.emit("error", error);
			throw error;
		}
	}

	async requestTransactionHistory(program: string): Promise<any[]> {
		try {
			const wallet = this._wallet;
			if (!wallet || !this.publicKey) throw new WalletNotConnectedError();

			try {
				const result = await wallet.requestTransactionHistory(program);
				return result.transactions;
			} catch (error: any) {
				throw new WalletRecordsError(error?.message, error);
			}
		} catch (error: any) {
			this.emit("error", error);
			throw error;
		}
	}

	async connect(decryptPermission: DecryptPermission, network: WalletAdapterNetwork): Promise<void> {
		try {
			if (this.connected || this.connecting) return;
			if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

			this._connecting = true;

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const wallet = window.soterWallet! || window.soter!;

			try {
				await wallet.connect(decryptPermission, network);
				if (!wallet?.publicKey) {
					throw new WalletConnectionError();
				}
				this._publicKey = wallet.publicKey!;
			} catch (error: any) {
				throw new WalletConnectionError(error?.message, error);
			}

			this._wallet = wallet;
			this._decryptPermission = decryptPermission;
			this._viewKey = this._viewKey;

			this.emit("connect", this._publicKey);
		} catch (error: any) {
			this.emit("error", error);
			throw error;
		} finally {
			this._connecting = false;
		}
	}

	async disconnect(): Promise<void> {
		const wallet = this._wallet;
		if (wallet) {
			// wallet.off('disconnect', this._disconnected);

			this._wallet = null;
			this._publicKey = null;

			try {
				await wallet.disconnect();
			} catch (error: any) {
				this.emit("error", new WalletDisconnectionError(error?.message, error));
			}
		}

		this.emit("disconnect");
	}

	async signMessage(message: Uint8Array): Promise<Uint8Array> {
		try {
			const wallet = this._wallet;
			if (!wallet || !this.publicKey) throw new WalletNotConnectedError();

			try {
				const signature = await wallet.signMessage(message);
				return signature.signature;
			} catch (error: any) {
				throw new WalletSignTransactionError(error?.message, error);
			}
		} catch (error: any) {
			this.emit("error", error);
			throw error;
		}
	}
}
