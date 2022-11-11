import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { decryptPrivateKey, decryptUriFile } from "./metamask";

const SetDecrypt = props => {

    const { drizzle, drizzleState, encData, encPrivateKey, typeData, showDialod } = props;
    const [encryptedInfo, setEncryptedInfo] = useState('');
    const [decryptedPK, setDecryptedPK] = useState('');
    const [decryptedInfo, setDecryptedInfo] = useState('');
    const [decPk, setDecPk] = useState(false);
    const [decInfoShow, setDecInfoShow] = useState(false);
    const { register, handleSubmit, watch, errors } = useForm();

    useEffect(() => {
        setEncryptedInfo(encData);
    }, [encData]);

    useEffect(() => {
        if (decPk) {
            async function getDecryptMessage() {
                if (encPrivateKey !== '') {
                    const dm = await decryptPrivateKey(encPrivateKey, drizzleState.accounts[0]);
                    console.log("🚀 ~ file: SetDecrypt.js ~ line 20 ~ decryptMessage ~ decMessage", dm)
                    setDecryptedPK(dm)
                    setDecInfoShow(true)
                }
            }
            getDecryptMessage()

        }
    }, [decPk, encPrivateKey]);

    useEffect(() => {
        if (decryptedPK && encData && encData.length > 100) {
            async function getDecryptMessage() {
                const dm = await decryptUriFile(encData, decryptedPK);
                setDecryptedInfo(dm)

            }
            getDecryptMessage()

        }
    }, [decryptedPK, encData]);

    // const onFileChange = (event) => {
    //     let file = event.target.files[0];

    //     let fileReader = new FileReader();
    //     fileReader.readAsText(file);

    //     fileReader.onload = (event) => {
    //         let fileAsText = event.target.result;
    //         setEncryptedInfo(fileAsText);
    //     };
    // };

    const showDecryptByTypeData = (type) => {
        return (
            <>
                {[0, '0'].includes(type) && <div name="decrypredData"
                    className="u-full-width"><textarea rows={20} cols={80} value={decryptedInfo}   />!!!!!</div>}
                {[1, '1'].includes(type) && <div><img name="decrypredData"
                    className="u-full-width" src={decryptedInfo} />
                </div>}
                {
                    [2, '2'].includes(type) && <div name="decrypredData"
                    className="u-full-width"><textarea rows={40} cols={80} value={decryptedInfo}   /></div>
                }
            </>
        )
    }

    return (
        <section>
            <div className="row">
                <div className="six columns">
                    <label htmlFor="decrypredData">Decrypted Data</label>
                    {showDecryptByTypeData(typeData)}

                </div>
            </div>
            <button className="btn-upload" onClick={() => setDecPk(!decPk)} >Decrypt Data</button>
            {/* <button className="btn-upload" onClick={() => showDialod(false)} >close</button> */}
        </section>
    );
};
export default SetDecrypt;
