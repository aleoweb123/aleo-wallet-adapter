import type { DetailedHTMLProps, FC, ImgHTMLAttributes } from 'react';
import { Wallet } from '@aleo123/aleo-wallet-adapter-react';
export interface WalletIconProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    wallet: Wallet | null;
}
export declare const WalletIcon: FC<WalletIconProps>;
