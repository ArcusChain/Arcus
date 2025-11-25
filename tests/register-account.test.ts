import test from 'node:test';
import assert from 'node:assert/strict';
import { Connection, VersionedTransaction } from '@solana/web3.js';

import { ArcusClient } from '../src/client/arcus-client';
import { ArcusWallet } from '../src/client/arcus-wallet';
import type { Sha3Hash } from '../src/types/cryptography';
import { loadLocalKeypair } from './helpers/local-keypair';

/**
 * Integration-style test for `registerAccountForConfidentialityAndAnonymity`.
 *
 * This test exercises the "signed" mode so that no transaction is actually sent to the network;
 * instead, a signed {@link VersionedTransaction} is returned.
 *
 * NOTE: This test is skipped by default. Remove `{ skip: true }` to run it locally.
 */

function createTestConnection(): Connection {
        return new Connection('https://api.devnet.solana.com', 'confirmed');
}

test(
        'registerAccountForConfidentialityAndAnonymity returns a signed transaction',
        { skip: true },
        async () => {
                const connection = createTestConnection();
                const client = await ArcusClient.create({ connection });

                const keypair = loadLocalKeypair();
                const wallet = await ArcusWallet.fromSigner({ signer: { keypair } as any });
                await client.setArcusWallet(wallet);

                // A real zkProver configuration is required for a full integration test. For now we assume
                // that the client has been configured with a prover elsewhere, or you can inject one here.
                // Example (uncomment and adjust as needed):
                //
                client.setZkProver('wasm', {
                        masterViewingKeyRegistration: true,
                        createSplDepositWithHiddenAmount: true,
                        createSplDepositWithPublicAmount: true,
                        claimSplDepositWithHiddenAmount: true,
                        claimSplDeposit: true,
                });

                const optionalData = new Uint8Array(32) as Sha3Hash;

                const result = await client.registerAccountForConfidentialityAndAnonymity(
                        optionalData,
                        { mode: 'signed' }
                );

                assert.ok(result instanceof VersionedTransaction);
        }
);
