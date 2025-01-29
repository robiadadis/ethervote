import { useState, useEffect } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
const Election_ABI = require("../../utils/Election.json");
import CryptoJS from 'crypto-js';
import NotInit from "../../components/NotInit";

// Font Awesome Library
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas, faWallet, faAddressCard, faCheckToSlot } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
library.add(fas, fab, faWallet, faAddressCard, faCheckToSlot);

// Notification Message
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Encrypt data using AES Encryption
function encryptData(data, secretKey) {
    const ciphertext = CryptoJS.AES.encrypt(data, secretKey).toString();
    return ciphertext;
};

// Decrypt data using AES Decryption
function decryptData(ciphertext, secretKey) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
};

export default function Registration() {
    // Contract Address & ABI
    const contractAddress = "0xe81ebd830831CE5a1A018F713eE439400B19DBB2";
    const contractABI = Election_ABI.abi;

    const [isAdmin, setisAdmin] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [loadingVoter, setLoadingVoter] = useState({});
    const [elStarted, setelStarted] = useState(false);
    const [elEnded, setelEnded] = useState(false);
    const [voterCount, setvoterCount] = useState(undefined);
    const [voters, setvoters] = useState([]);
    const [secretKey, setsecretKey] = useState(process.env.NEXT_PUBLIC_SECRET_KEY);
    const { data: signer } = useSigner();
    const [currentAccount, setcurrentAccount] = useState(null);

    const { address, isDisconnected } = useAccount({
        onDisconnect() {
            setcurrentAccount(null);
        },
    });

    useEffect(() => {
        checkIfWalletConnected();
    }, [address]);

    useEffect(() => {
        if (signer) {
            checkAdmin();
            checkStart();
        }
    }, [signer]);

    const electionInstance = new ethers.Contract(contractAddress, contractABI, signer);

    const checkIfWalletConnected = async () => {
        try {
            if (!isDisconnected) {
                setcurrentAccount(address);
            } else {
                setcurrentAccount(null);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const checkAdmin = async () => {
        if (signer) {
            try {
                const admin = await electionInstance.getAdmin();

                if (address === admin) {
                    setisAdmin(true);
                }
            } catch (error) {
                console.error("Error checking admin:", error);
            }
        } else {
            console.warn("Signer not available. Ensure that a wallet is connected.");
        }
    }

    const checkStart = async () => {
        try {
            const start = await electionInstance.getStart();
            setelStarted(start);
            const end = await electionInstance.getEnd();
            setelEnded(end);
            if (start === true) {
                fetchVotersDetail();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const fetchVotersDetail = async () => {
        try {
            const cekCount = await electionInstance.getTotalVoter();
            const totalVoterCount = cekCount.toNumber();
            setvoterCount(totalVoterCount);

            const uniqueAddresses = new Set();
            const newVoters = [];

            for (let i = 1; i <= cekCount.toNumber(); i++) {
                const voterAddress = await electionInstance.voters(i - 1);

                if (!uniqueAddresses.has(voterAddress)) {
                    uniqueAddresses.add(voterAddress);

                    const voter = await electionInstance.voterDetails(voterAddress);
                    const decryptedName = decryptData(voter.name, secretKey);
                    const decryptedPhone = decryptData(voter.phone, secretKey);

                    newVoters.push({
                        address: voter.voterAddress,
                        name: decryptedName,
                        phone: decryptedPhone,
                        hasVoted: voter.hasVoted,
                        isVerified: voter.isVerified,
                        isRegistered: voter.isRegistered,
                    });
                }
            }

            setvoters(newVoters);
        } catch (error) {
            console.error("Error fetching voter:", error);
        }
    };


    const verifyUser = async (verifiedStatus, address) => {
        try {
            // Loader
			setLoadingVoter((prev) => ({ ...prev, [address]: true }));

            // Start Tx
            const verifyVoter = await electionInstance.verifyVoter(verifiedStatus, address);
            await verifyVoter.wait();

            // If Tx Success
            toast.success("Transaction confirmed. User successfully verified!");
            
            window.location.reload();
        } catch (error) {
            console.error(error);
			toast.error("User rejected transaction.");
        } finally {
            // Stop Loader
			setLoadingVoter((prev) => ({ ...prev, [address]: false }));
        }
    };

    const VoterTable = ({ voters, verifyUser, verified }) => {
        return (
            <div className="w-full">
                <table className="w-full text-center">
                    <tbody>
                        {voters.map((voter) => (
                            <div key={voter.address} className="mb-10">
                                <tr className="bg-lightgray">
                                    <th className="border border-gray border-opacity-20 text-dark text-base font-medium p-2">Wallet Address</th>
                                    <td className="border border-gray border-opacity-20 text-dark p-2">
                                        <div className="flex justify-center">
                                            <div className="overflow-x-auto max-w-[250px] md:w-96 md:max-w-[none] w-full">
                                                <span className="text-dark text-sm">
                                                    {voter.address}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="bg-white">
                                    <th className="border border-gray border-opacity-20 text-dark text-base font-medium p-2">Name</th>
                                    <td className="border border-gray border-opacity-20 text-dark text-sm p-2">{voter.name}</td>
                                </tr>
                                <tr className="bg-lightgray">
                                    <th className="border border-gray border-opacity-20 text-dark text-base font-medium p-2">Phone</th>
                                    <td className="border border-gray border-opacity-20 text-dark text-sm p-2">{voter.phone}</td>
                                </tr>
                                <tr className="bg-white">
                                    <th className="border border-gray border-opacity-20 text-dark text-base font-medium p-2">Voted</th>
                                    <td
                                        className={`border border-gray border-opacity-20 text-sm font-medium p-2 ${
                                            voter.hasVoted ? "text-lime-500" : "text-crimson"
                                        }`}
                                    >
                                        {voter.hasVoted ? "True" : "False"}
                                    </td>
                                </tr>
                                <tr className="bg-lightgray">
                                    <th className="border border-gray border-opacity-20 text-dark text-base font-medium p-2">Verification</th>
                                    <td
                                        className={`border border-gray border-opacity-20 text-sm font-medium p-2 ${
                                            voter.isVerified ? "text-lime-500" : "text-crimson"
                                        }`}
                                    >
                                        {voter.isVerified ? "True" : "False"}
                                    </td>
                                </tr>
                                {!verified && !voter.isVerified && (                          
                                    <button
                                        type="button"
                                        className="text-lime-500 p-3 w-full bg-dark cursor-pointer rounded-sm shadow-sm hover:text-lime-600 transition duration-300 ease-in-out"
                                        onClick={() => verifyUser(true, voter.address)}
                                        disabled={
                                            loadingVoter[voter.address]
                                        }
                                    >
                                        {loadingVoter[voter.address] ? (
                                            <div className="flex items-center justify-center">
                                                <svg
                                                    className="animate-spin -mt-1 h-7 w-7 text-white inline-block"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle className="opacity-15" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path
                                                        className="opacity-50"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                            </div>
                                        ) : (
                                            <p className="font-semibold">Approve</p>
                                        )}
                                        
                                    </button>      
                                )}
                            </div>
                        ))}
                    </tbody>
                </table>
            </div>

        );
    };

    return (
        <>
            {isDisconnected ?
                (<>
                    {/* Wallet Disconnect */}
                    <div className="-mt-20 h-screen flex flex-col justify-center items-center">
                        <FontAwesomeIcon icon="fa-solid fa-link" className="animate-bounce"/>
                        <p className="text-dark font-medium text-lg mt-2">[ <span className="text-gray">Please connect your wallet</span> ]</p>
                    </div>
                </>) :
                (<>
                    {!isAdmin ? (
                        <>
                            {/* Admin Access Only */}
                            <div className="-mt-20 h-screen flex flex-col justify-center items-center">
                                <FontAwesomeIcon icon="fa-solid fa-lock" className="animate-bounce text-crimson" />
                                <p className="text-dark font-medium text-lg mt-2 w-1/2 text-center">[ <span className="text-gray">Access to the verification page is restricted to admin only</span> ]</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="container">
                                {!elStarted && !elEnded ? (
                                    <NotInit />
                                ) : elStarted && !elEnded ? (
                                    <>
                                        <ToastContainer
                                            position="bottom-right"
                                            autoClose={5000}
                                            hideProgressBar={false}
                                            newestOnTop={false}
                                            closeOnClick
                                            rtl={false}
                                            pauseOnFocusLoss
                                            draggabl
                                            pauseOnHover
                                        />
                                        <div className="w-full min-h-screen px-5">
                                            <div className="flex flex-col justify-center items-center w-full">
                                                <div className="flex flex-col justify-center items-center my-10">
                                                    <p className="text-dark font-semibold text-xl">[ Verification ]</p>
                                                    <p className="text-gray font-medium">Total Voters: {voters.length}</p>
                                                </div>
                                                <div className="flex flex-col w-full items-center">
                                                    {voters.length === 0 ? (
                                                        <div className="flex justify-center items-center w-full bg-dark p-5">
                                                            <FontAwesomeIcon icon="fa-solid fa-xmark" className="mr-1 text-crimson"/>
                                                            <p className="text-white text-sm text-center">No voters have registered yet.</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-dark text-lg font-semibold">List of Registered Voters</p>
                                                            <div className="w-full border-t border-gray border-opacity-50 mt-5 mb-10"></div>
                                                            <div className="flex flex-col w-full justify-center items-center">
                                                                <div className="w-full flex justify-center">
                                                                    <div className="overflow-x-auto mx-auto">
                                                                        {voters.filter((voter) => !voter.isVerified).length > 0 && (
                                                                            <>
                                                                                <div className="flex flex-row justify-center items-center mb-5">
                                                                                    <FontAwesomeIcon icon="fa-solid fa-xmark" className="mr-1 text-crimson"/>
                                                                                    <p className="text-gray text-center text-lg font-medium">Unverified Voters</p>
                                                                                </div>
                                                                                <VoterTable 
                                                                                    voters={voters.filter((voter) => !voter.isVerified)} 
                                                                                    verifyUser={verifyUser} 
                                                                                    verified={false} 
                                                                                />
                                                                            </>
                                                                        )}
                                                                        {voters.filter((voter) => voter.isVerified).length > 0 && (
                                                                            <>
                                                                                {voters.filter((voter) => !voter.isVerified).length > 0 && (
                                                                                    <div className="w-full border-t border-gray border-opacity-50 mt-5 mb-10"></div>
                                                                                )}
                                                                                <div className="flex flex-row justify-center items-center mb-5">
                                                                                    <FontAwesomeIcon icon="fa-solid fa-check" className="mr-1 text-lime-500"/>
                                                                                    <p className="text-gray text-center text-lg font-medium">Verified Voters</p>
                                                                                </div>
                                                                                <div className="mb-5">
                                                                                    <VoterTable 
                                                                                        voters={voters.filter((voter) => voter.isVerified)} 
                                                                                        verified={true}
                                                                                    />
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : !elStarted && elEnded ? (
                                    <>
                                        <div className="container -mt-20 w-full p-5">
                                            <div className="h-screen flex justify-center flex-col items-center">
                                                <div className="lg:w-1/2 shadow-sm">
                                                    <div className="bg-dark p-5 border">
                                                        <p className="text-white text-center text-lg">[ <span className="text-crimson">The election has ended</span> ]</p>
                                                    </div>
                                                    <div className="p-5 border">
                                                        <p className="text-dark text-base text-center">The election period has officially ended. All votes have been securely recorded and verified using the blockchain-based e-voting system. To view the final results, please click the button below.</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-center mt-10 mb-2">
                                                    <FontAwesomeIcon icon="fa-solid fa-caret-down" className="animate-bounce"/>
                                                </div>
                                                <div className="flex justify-center">
                                                    <button className="text-dark hover:text-gray transition duration-300 ease-in-out text-baseq font-medium bg-lime-400 cursor-pointer py-3 px-5 shadow-sm rounded-sm">
                                                        <a
                                                            href="/Results"
                                                            className="text-center font-semibold"
                                                        >
                                                            Final results
                                                        </a>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </>
                    )}
                </>)}
        </>
    );
}