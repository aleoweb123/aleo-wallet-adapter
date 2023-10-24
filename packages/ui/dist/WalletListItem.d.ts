import type { FC, MouseEventHandler } from 'react';
import { Wallet } from '@aleo123/aleo-wallet-adapter-react';
export interface WalletListItemProps {
    handleClick: MouseEventHandler<HTMLButtonElement>;
    tabIndex?: number;
    wallet: Wallet;
}
export declare const WalletListItem: FC<WalletListItemProps>;
