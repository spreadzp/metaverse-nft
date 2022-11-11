import EthCrypto from 'eth-crypto';
import { metamaskEncrypt, getPublicKeyViaMetamask } from './metamask';

export async function getAccount() {
    return await window.ethereum.selectedAddress
}

export function getNewAccount() {
    return EthCrypto.createIdentity();
}


export async function encryptData(publicKey, data) {
    const pk = await getPublicKeyViaMetamask(publicKey) 
    return await metamaskEncrypt(data, pk)
}

export async function decrypt(cMessage) {
    const cyperObj = EthCrypto.cipher.parse(cMessage);
    return await EthCrypto.decryptWithPrivateKey(
        'bdb335a3c6dceda42eb92e6479f326d68d86bdf5237c41ff1eedf961813d2eb4', // privateKey
        cyperObj // encrypted-data
    );
}