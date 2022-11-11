import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Table } from 'react-bootstrap';
import { BigNumber, ethers, utils } from 'ethers'
import { create } from 'ipfs-http-client'
import SetDecrypt from "./SetDecrypt";
const client = create('https://ipfs.infura.io:5001/api/v0')

const OwnerAssets = props => {

    const { drizzle, drizzleState } = props;
    const [sellerSoldAmounts, setSellerSoldAmounts] = useState([]);
    const [encryptedPrivateKey, setEncryptedPrivateKey] = useState('');
    const [decryptedInfo, setDecryptedInfo] = useState('');
    const [encData, setEncData] = useState('');
    const [showDecryptModule, setShowDecryptModule] = useState(false);

    const [typeData, setTypeData] = useState(0)
    const [choosedToken, setChoosedToken] = useState(null)
    const contract = drizzle.contracts.EncNft;

    const contractMarket = drizzle.contracts.MarketPlace;
    const typeFileNames = ['#text', '#image', '#file']
    const cutParams = [{ start: 5, end: -3 }, { start: 6, end: -4 }, { start: 5, end: -3 }]


    useEffect(() => {
        async function countOfTokens() {
            const result = await contract.methods
                .getIdsByAddress(drizzleState.accounts[0])
                .call({ from: drizzleState.accounts[0] });
            console.log('result   ', result);
            if (result && result.length) {

                Promise.all(
                    result.map(async (id) => {
                        const soldBalance = await contractMarket.methods
                            .getOwnerInfo(id, drizzleState.accounts[0])
                            .call({ from: drizzleState.accounts[0] });

                        const currentOwnerInfo = await contract.methods.getTokenInfoLastOwner(id).call({ from: drizzleState.accounts[0] });
                        console.log(id, "🚀 ~ file: OwnerAssets.js ~ line 42 ~ result.map ~  currentOwnerInfo", currentOwnerInfo.encData, currentOwnerInfo.owner)

                        const uriInfo = await contract.methods.tokenURI(id).call({ from: drizzleState.accounts[0] });

                        const parsedUri = JSON.parse(uriInfo)
                        console.log("🚀 ~ file: OwnerAssets.js ~ line 48 ~ result.map ~ parsedUri", parsedUri)
                        setSellerSoldAmounts(sellerSoldAmounts => [...sellerSoldAmounts, { idToken: id, balance: soldBalance, currentOwner: currentOwnerInfo.owner, encPrivateKey: currentOwnerInfo.encData, ...parsedUri }])
                    })
                )
            }
            console.log('sellerSoldAmounts :>> ', sellerSoldAmounts);
        }
        countOfTokens()
    }, [])

    useEffect(() => {
        if (choosedToken) {
            getTypeDataFromDescription(choosedToken.description)

            //const path = choosedToken.image.split('/')
            console.log('choosedToken.image :>> ', choosedToken.image);

            const getInfoFromIPFS = async (ipfsPath) => {
                const responseProxy = await fetch(ipfsPath)
                let response = await fetch(responseProxy.url);

                const reader = response.body.getReader();

                // Шаг 2: получаем длину содержимого ответа
                const contentLength = +response.headers.get('Content-Length');

                // Шаг 3: считываем данные:
                let receivedLength = 0; // количество байт, полученных на данный момент
                let chunks = []; // массив полученных двоичных фрагментов (составляющих тело ответа)
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        break;
                    }

                    chunks.push(value);
                    receivedLength += value.length;

                    console.log(`Получено ${receivedLength} из ${contentLength}`)
                }

                // Шаг 4: соединим фрагменты в общий типизированный массив Uint8Array
                let chunksAll = new Uint8Array(receivedLength); // (4.1)
                let position = 0;
                for (let chunk of chunks) {
                    chunksAll.set(chunk, position); // (4.2)
                    position += chunk.length;
                }

                // Шаг 5: декодируем Uint8Array обратно в строку
                let result = new TextDecoder("utf-8").decode(chunksAll);
                console.log("🚀 ~ file: OwnerAssets.js ~ line 99 ~ getInfoFromIPFS ~ result", result)
                setEncData(result)
            }


            getInfoFromIPFS(choosedToken.image)
        }


    }, [choosedToken])


    const withdrawSum = async (idToken) => {

        const resultWithdraw = await contractMarket.methods.sellerWithdrawSum(idToken).send({
            from: drizzleState.accounts[0],
            gasPrice: 5 * 10 ** 10, gasLimit: 400000
        })
        console.log("🚀 ~ file: OwnerAssets.js ~ line 57 ~ result ~ result", resultWithdraw)
    };

    const getTypeDataFromDescription = (description) => {
        console.log("🚀 ~ file: OwnerAssets.js ~ line 78 ~ getTypeDataFromDescription ~ description", description)
        typeFileNames.map((name, ind) => {

            if (description.includes(name)) {
                setTypeData(ind)
            }
        })
    }

    const decryptInfo = async (token) => {
        console.log("🚀 ~ file: OwnerAssets.js ~ line 85 ~ decryptInfo ~ token", token)
        if (!choosedToken || choosedToken !== token || showDecryptModule) {
            setChoosedToken(token)
            getTypeDataFromDescription(token.description)
            setShowDecryptModule(true)
        }
    }
    useEffect(() => {

        if (choosedToken && choosedToken.encPrivateKey !== encryptedPrivateKey) {
            setEncryptedPrivateKey(choosedToken.encPrivateKey)
            getTypeDataFromDescription(choosedToken.description)

            setShowDecryptModule(true)
        }


    }, [decryptInfo, choosedToken, showDecryptModule])


    const compareAddresses = (add1, add2) => {
        return add1 === add2
    }

    const callbackFromDecrypt = (flag) => {
        setShowDecryptModule(flag)
    }

    return (
        <section>
            <h2>My assets</h2>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID NFT</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Sum for withdraw</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        sellerSoldAmounts.map((token, i) =>
                        (<tr key={i}>
                            <td>{token.idToken}</td>
                            <td>{token.name}</td>
                            <td>{token.description}</td>
                            <td>{utils.commify(+token.balance / 1e18)} ETH</td>
                            <td>{token.balance > 0 ?
                                <button className="btn-withdraw" onClick={() => withdrawSum(token.idToken)}>Withdraw</button> :
                                compareAddresses(token.currentOwner, drizzleState.accounts[0]) ?
                                    <button className="btn-decrypt" onClick={function () { return decryptInfo(token) }}>Decrypt data of the NFT </button> :
                                    'You sold the token and withdraw all sum'
                            }</td>
                        </tr>))

                    }

                </tbody>
            </Table>
            {showDecryptModule && <SetDecrypt
                drizzle={drizzle}
                drizzleState={drizzleState}
                encData={encData}
                encPrivateKey={encryptedPrivateKey}
                typeData={typeData}
                showDialod={callbackFromDecrypt}
            />}
        </section>
    );
};
export default OwnerAssets;
