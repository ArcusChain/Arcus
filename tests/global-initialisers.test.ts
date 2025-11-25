import test from 'node:test';
import assert from 'node:assert/strict';
import { Connection } from '@solana/web3.js';

import { ArcusClient } from '../src/client/arcus-client';
import { ArcusWallet } from '../src/client/arcus-wallet';
import type {
        InstructionSeed,
        AccountOffset,
        NumberOfTransactions,
        RiskThreshold,
} from '../src/types/miscellaneous';
import type { MintAddress } from '../src/types/solana';
import type { Sha3Hash } from '../src/types/cryptography';
import { loadLocalKeypair } from './helpers/local-keypair';

/**
 * NOTE:
 * These tests are written as **integration-style** examples. They assume:
 * - Access to a running Solana cluster (e.g. devnet or localnet).
 * - A funded local keypair at `~/.config/solana/id.json`.
 *
 * They are marked as `skip` by default to avoid accidental execution
 * against production networks. Remove `{ skip: true }` to run them locally.
 */

function createTestConnection(): Connection {
        // Adjust to your preferred RPC endpoint (e.g. local validator or devnet).
        return new Connection('https://api.devnet.solana.com', 'confirmed');
}

async function createClientWithWallet(): Promise<ArcusClient> {
        const connection = createTestConnection();
        const client = await ArcusClient.create({ connection });

        const keypair = loadLocalKeypair();
        const wallet = await ArcusWallet.fromSigner({ signer: { keypair } as any });

        await client.setArcusWallet(wallet);

        // Monkey-patch forwarding to avoid actually sending transactions during tests.
        (client as any).connectionBasedForwarder.forwardTransaction = async () =>
                'FAKE_SIGNATURE' as any;

        return client;
}

test('initialiseProgramInformation builds and forwards a transaction', { skip: true }, async () => {
        const client = await createClientWithWallet();

        const sig = await client.initialiseProgramInformation(
                100n as NumberOfTransactions,
                new Uint8Array(16) as RiskThreshold,
                new Uint8Array(32) as Sha3Hash
        );

        assert.equal(typeof sig, 'string');
});

test(
        'initialiseMasterWalletSpecifier builds and forwards a transaction',
        { skip: true },
        async () => {
                const client = await createClientWithWallet();
                const wallet = (client as any).arcusWallet as ArcusWallet;
                const masterAddress = await wallet.signer.getPublicKey();

                const sig = await client.initialiseMasterWalletSpecifier(masterAddress);
                assert.equal(typeof sig, 'string');
        }
);

test('initialiseWalletSpecifier builds and forwards a transaction', { skip: true }, async () => {
        const client = await createClientWithWallet();
        const wallet = (client as any).arcusWallet as ArcusWallet;
        const allowedAddress = await wallet.signer.getPublicKey();

        const sig = await client.initialiseWalletSpecifier(
                1 as InstructionSeed,
                allowedAddress,
                new Uint8Array(32) as Sha3Hash
        );
        assert.equal(typeof sig, 'string');
});

test('initialiseRelayerAccount builds and forwards a transaction', { skip: true }, async () => {
        const client = await createClientWithWallet();

        const mint = new Uint8Array(32) as unknown as MintAddress;
        const endpoint = new Uint8Array(32) as Sha3Hash;

        const sig = await client.initialiseRelayerAccount(mint, endpoint);
        assert.equal(typeof sig, 'string');
});

test('initialiseRelayerFeesAccount builds and forwards a transaction', { skip: true }, async () => {
        const client = await createClientWithWallet();

        const mint = new Uint8Array(32) as unknown as MintAddress;
        const sig = await client.initialiseRelayerFeesAccount(
                mint,
                1 as InstructionSeed,
                0 as AccountOffset
        );
        assert.equal(typeof sig, 'string');
});

test(
        'initialisePublicCommissionFeesPool builds and forwards a transaction',
        { skip: true },
        async () => {
                const client = await createClientWithWallet();

                const mint = new Uint8Array(32) as unknown as MintAddress;
                const sig = await client.initialisePublicCommissionFeesPool(
                        mint,
                        1 as InstructionSeed,
                        0 as AccountOffset
                );
                assert.equal(typeof sig, 'string');
        }
);

test('initialiseZkMerkleTree builds and forwards a transaction', { skip: true }, async () => {
        const client = await createClientWithWallet();
        const mint = new Uint8Array(32) as unknown as MintAddress;

        const sig = await client.initialiseZkMerkleTree(mint, new Uint8Array(32) as Sha3Hash);
        assert.equal(typeof sig, 'string');
});

test('initialiseMixerPool builds and forwards a transaction', { skip: true }, async () => {
        const client = await createClientWithWallet();
        const mint = new Uint8Array(32) as unknown as MintAddress;

        const sig = await client.initialiseMixerPool(mint, new Uint8Array(32) as Sha3Hash);
        assert.equal(typeof sig, 'string');
});
