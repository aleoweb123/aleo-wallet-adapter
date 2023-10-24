import { DecryptPermission, WalletAdapterNetwork } from '@aleo123/aleo-wallet-adapter-base';
import type { CSSProperties, FC, MouseEvent, PropsWithChildren, ReactElement } from 'react';
export declare type ButtonProps = PropsWithChildren<{
    className?: string;
    disabled?: boolean;
    decryptPermission?: DecryptPermission;
    network?: WalletAdapterNetwork;
    endIcon?: ReactElement;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    startIcon?: ReactElement;
    style?: CSSProperties;
    tabIndex?: number;
}>;
export declare const Button: FC<ButtonProps>;
