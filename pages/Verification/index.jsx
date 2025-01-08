import { useState, useEffect } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
const Election_ABI = require("../../utils/Election.json");
// const PolyVote_ABI = require("../../utils/PolyVote.json");
import CryptoJS from 'crypto-js';
import NotInit from "../../components/NotInit";
import { BsFillFileLock2Fill } from "react-icons/bs";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas, faWallet, faAddressCard, faCheckToSlot } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Menambahkan ikon ke library FontAwesome
library.add(fas, fab, faWallet, faAddressCard, faCheckToSlot);

// Encrypt data using AES encryption
function encryptData(data, secretKey) {
    const ciphertext = CryptoJS.AES.encrypt(data, secretKey).toString();
    return ciphertext;
};

// Decrypt data using AES decryption
function decryptData(ciphertext, secretKey) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
};

// Encrypt data using SHA-256 encryption
// function encryptData(data, secretKey) {
// 	const hash = CryptoJS.SHA256(data + secretKey).toString(); // Combine data with secretKey and hash
// 	return hash;
// };

// // Placeholder function for decryption (SHA-256 cannot be decrypted)
// function decryptData(ciphertext, secretKey) {
// 	console.log("SHA-256 is a one-way hash function. Decryption is not possible.");
// 	return null; // Return null since decryption isn't applicable for SHA-256
// };

export default function Registration() {

    // Contract Address & ABI
    const contractAddress = "0x48996909d258fC788137f5620AE95Deb7b4f26A8";
    const contractABI = Election_ABI.abi;

    const [isAdmin, setisAdmin] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [elStarted, setelStarted] = useState(false);
    const [elEnded, setelEnded] = useState(false);
    const [voterCount, setvoterCount] = useState(undefined);
    const [voters, setvoters] = useState([]);
    
    const [secretKey, setsecretKey] = useState(process.env.NEXT_PUBLIC_SECRET_KEY || 'default_secret_key');
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
    // const polyInstance = new ethers.Contract(PolyCA, PolyABI, signer);

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
        // Check if signer is available
        if (signer) {
            // const electionContract = new ethers.Contract(contractAddress, contractABI, signer);

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

            // Loading Candidates details
            const uniqueAddresses = new Set(); // Create a Set to store unique voter addresses
            const newVoters = [];

            for (let i = 1; i <= cekCount.toNumber(); i++) {
                const voterAddress = await electionInstance.voters(i - 1);

                // Check if the address is already in the Set, if not, process the data
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

            const verifyVoter = await electionInstance.verifyVoter(verifiedStatus, address);

            await verifyVoter.wait();

            // const verifyWhitelist = await polyInstance.addWhiteList(address)

            // await verifyWhitelist.wait();

            window.location.reload();

        } catch (error) {
            console.error("Error verifying user:", error);
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
                                        className="text-white p-3 w-full bg-dark cursor-pointer rounded-sm shadow-sm hover:text-lime-500 transition duration-300 ease-in-out"
                                        onClick={() => verifyUser(true, voter.address)}
                                    >
                                        Approve
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
                    <div className="min-h-screen">
                        <div className="loader">
                            <p className="text-white font-semibold text-lg mt-1"> Hubungkan dengan dompet anda </p>
                        </div>
                    </div>
                </>) :
                (<>
                    {!isAdmin ? (
                        <>
                            <div className="flex justify-center items-center h-screen">
                                <div className="p-8 text-white text-center">
                                    <h1 className="text-3xl">Verifikasi</h1>
                                    <p className="text-xl">Hanya dapat diakses oleh admin.</p>
                                    <BsFillFileLock2Fill fontSize={64} className="mt-5 mx-auto text-white  text-center" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="">
                                <div className="container">
                                    {!elStarted && !elEnded ? (
                                        <NotInit />
                                    ) : elStarted && !elEnded ? (
                                        <>
                                            <div className="w-full min-h-screen">
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
                                            <div className="container h-screen -mt-20 flex justify-center items-center">
                                                <div className="xl:w-1/2">
                                                    <div className="shadow-sm">
                                                        <div className="bg-dark p-5 border">
                                                            <p className="text-dark text-center text-base">[ <span className="text-crimson">The election has ended</span> ]</p>
                                                        </div>
                                                        <div className="p-8 border">
                                                            <p className="text-dark text-sm">The election period has officially ended. All votes have been securely recorded and verified using the blockchain-based e-voting system. To view the final results, please click the button below.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-center mt-10 mb-2">
                                                        <FontAwesomeIcon icon="fa-solid fa-caret-down" className="animate-bounce"/>
                                                    </div>
                                                    <div className="flex justify-center">
                                                        <button className="text-dark hover:text-gray transition duration-300 ease-in-out text-baseq font-medium bg-lime-400 cursor-pointer py-3 px-5 shadow-sm rounded-sm">
                                                            <a
                                                                href="/Results"
                                                                className="text-center"
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
                            </div>
                        </>
                    )}
                </>)}
        </>
    );
}