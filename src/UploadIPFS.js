import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { encrypt, encryptData, getAccount, getNewAccount } from "./cypher";
import SetDecrypt from "./SetDecrypt";
import { create } from 'ipfs-http-client'
import { metamaskEncrypt, metamaskEncryptData } from "./metamask";
import MintNFT from "./MintNFT";
import imageToBase64 from 'image-to-base64/browser';

import { Dropdown, FloatingLabel, Form, FormControl, InputGroup, SplitButton, Button } from "react-bootstrap";
const client = create('https://ipfs.infura.io:5001/api/v0')
const options = [
    { value: 0, label: 'text' },
    { value: 1, label: 'image' },
    { value: 2, label: 'file' }
]

const UploadIPFS = props => {
    const [fileUrl, updateFileUrl] = useState(``)
    const [stackId, setStackID] = useState(null);
    const [clearData, setClearData] = useState('');
    const [encryptedData, setEncryptedData] = useState('');
    const [encryptedPrivateKey, setEncryptedPrivateKey] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const { drizzle, drizzleState } = props;
    const [cid, setCid] = useState('')
    const [textFromIpfsFIle, setTextFromIpfsFIle] = useState('')
    const [newPrivateKey, setNewPrivateKey] = useState('')
    const [newPublicKey, setNewPublicKey] = useState('')
    const [newAddress, setNewAddress] = useState('')
    const [creatorAddress, setCreatorAddress] = useState('')
    const [typeDataToEncrypt, setTypeDataToEncrypt] = useState(0)
    const [selectedOption, setSelectedOption] = useState(0);
    const [choisedFile, setChoisedFile] = useState('')

    const [textArea, setTextArea] = useState('')

    const { register, handleSubmit, watch, errors } = useForm();
    async function onChange(e) {
        const file = e.target.files[0]
        try {
            const added = await client.add(file)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            updateFileUrl(url)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    const onSubmit = data => {
        console.log("🚀 ~ file: UploadIPFS.js ~ line 48 ~ data", data)
        setValue(data);
    };

    const encryptPrivateKeyForNFTFile = async () => {

        const encData = await encryptData(creatorAddress, newPrivateKey)
        if (encData !== '') {
            setEncryptedPrivateKey(encData)
        }

    };

    const setValue = async value => {
        console.log('clearData :>> ', clearData);
        setClearData(value.dataToEncrypt);
        setCustomerAddress(value.addressToEncrypt)

        const encData = await metamaskEncryptData(value.dataToEncrypt || clearData || textArea, newPublicKey)
        if (encData !== '') {
            setEncryptedData(encData)
        }
    };

    const downloadToFile = (content, filename, contentType) => {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });

        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();

        URL.revokeObjectURL(a.href);
    };

    useEffect(async () => {
        const address = await getAccount()
        if (address) {
            setCreatorAddress(address)
        }

    }, [getAccount, setCreatorAddress])

    useEffect(() => {
        if (encryptedData && creatorAddress) {
            async function sendEncryptInfoToIPFS() {
                // downloadToFile(encryptedData, `${customerAddress}.txt`, 'text/plain');
                const added = await client.add(encryptedData)
                setCid(added.path)
                const url = `https://ipfs.infura.io/ipfs/${added.path}`
                updateFileUrl(url)
            }

            sendEncryptInfoToIPFS();
        }


    }, [encryptedData, creatorAddress])


    const onFileChange = (event) => {
        let file = event.target.files[0];
        //setChoisedFile(file.name)
        console.log('selectedOption :>> ', selectedOption);
        let fileReader = new FileReader();
        fileReader.readAsText(file);
        fileReader.onload = (event) => {
            let fileAsText = event.target.result;
            setClearData(fileAsText);
        };
        fileReader.onerror = (error) => console.error('Error: ', error);

    };

    const getPath = () => {
        var inputName = document.getElementById('file1');
        var imgPath;

        imgPath = inputName.value;
        alert(imgPath);
        return imgPath;
    }

    const getInfoFromIPFS = async () => {
        if (fileUrl) {
            const result = await client.object.get(cid, { timeout: 30000 })
            const string = new TextDecoder().decode(result.Data).slice(0, -3);
            const cuttedString = string.slice(5)
            setTextFromIpfsFIle(cuttedString)
        }
    }

    const generateKeys = () => {
        const newIdentity = getNewAccount()
        setNewPrivateKey(newIdentity.privateKey)
        setNewPublicKey(newIdentity.publicKey)
        setNewAddress(newIdentity.address)
    }
    const getTxStatus = () => {
        // get the transaction states from the drizzle state
        const { transactions, transactionStack } = drizzleState;

        // get the transaction hash using our saved `stackId`
        const txHash = transactionStack[stackId];

        // if transaction hash does not exist, don't display anything
        if (!txHash) return null;

        // otherwise, return the transaction status
        return `Transaction status: ${transactions[txHash] &&
            transactions[txHash].status}`;
    };

    const handleChange = (value, selectOptionSetter) => {
        selectOptionSetter(value)
        // handle other stuff like persisting to store etc
    }
    const handleTextAreaChange = (event) => {
        if (event && event.target.value) {
            setTextArea(event.target.value)
            setClearData(event.target.event);
        }
    }
    function imageToBase64(img)
    {
        var canvas, ctx, dataURL, base64;
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        dataURL = canvas.toDataURL("image/png");
        base64 = dataURL.replace(/^data:image\/png;base64,/, "");
        return base64;
    }
    return (
        <div className="App">
            <h1>Mint encoded NFT</h1>
            <section>
                <h2>Step 1: create private key for the NFT</h2>

                <button className="btn-upload" onClick={() => generateKeys()}>Generate keys for encryption a data</button>
                <div>pk: {newPrivateKey}</div>
                <div>pubkey: {newPublicKey}</div>
                <div>add: {newAddress}</div>
                <div>Creator address{creatorAddress}</div>
                {newPrivateKey && <h2>Step 2: Encrypt private key using the creator public key</h2>}
                {newPrivateKey && <button className="btn-upload" onClick={() => encryptPrivateKeyForNFTFile()}>Encrypt private key</button>}
                <div>Encrypted private key</div>
                <div>{encryptedPrivateKey}</div>
                <br></br>

                {encryptedPrivateKey && <h2>Step 3: Encrypt data via generated public key for NFT and upload it to IPFS </h2>}
                {encryptedPrivateKey &&

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <label>Choice type data</label>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlSelect">
                            <Form.Select aria-label="Floating label select example" value={selectedOption}
                                onChange={e => handleChange(e.target.value, setSelectedOption)}>
                                {options.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        {selectedOption === '1' ? <><Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <label>Paste base64 string of the image</label>

                            <textarea rows={8} value={textArea} onChange={handleTextAreaChange} />
                            <div>Your image must be less than 1Mb for the service below</div>
                        </Form.Group>
                            {
                                selectedOption === '1' && <input type="button" className="btn-upload" onClick={() => window.open("https://www.base64-image.de/", "_blank")} value="toBase64" />
                            }
                        </> :
                            <>{
                                selectedOption === '0' && <div className="row">
                                    <div className="u-full-width">
                                        <label htmlFor="mURI">Data for encryption</label>
                                        <input
                                            name="dataToEncrypt"
                                            className="u-full-width"
                                            placeholder="string data"
                                            ref={register({ required: false, maxLength: 80000 })}
                                        />
                                        {errors.dataToEncrypt && <span>Use a valid input</span>}
                                    </div>
                                </div>
                            }
                                {
                                    selectedOption === '2' && <div className="row">
                                        <div className="u-full-width">
                                            <input type="file" id="upload"
                                                name="fileToEncrypt"
                                                className="u-full-width"
                                                onChange={onFileChange}
                                                hidden />
                                            <label className="label-upload" htmlFor="upload">Choose file</label>                                           
                                            {errors.fileToEncrypt && <span>Use a valid input</span>}
                                            {choisedFile}
                                        </div>
                                    </div>}
                            </>
                        }
                        {clearData !== '' && <input className="btn-upload" type="submit" value="Push encoded data to IPFS" />}
                    </form>
                }
                {fileUrl && <h2>Step 4: Test to decrypt the encrypted data and stored to IPFS </h2>}
                {fileUrl && <SetDecrypt
                    drizzle={drizzle}
                    drizzleState={drizzleState}
                    encData={encryptedData}
                    encPrivateKey={encryptedPrivateKey}
                    typeData={selectedOption}
                />}
            </section>
            <a href={fileUrl} target="_blank">{fileUrl}</a>
            {fileUrl && <h2>Step 5: Mint NFT with encrypted data </h2>}
            {fileUrl && <MintNFT
                drizzle={drizzle}
                drizzleState={drizzleState}
                ipfsLink={fileUrl}
                encryptedKey={encryptedPrivateKey}
                typeData={selectedOption}
            />
            }
        </div>
    );
};

export default UploadIPFS;
