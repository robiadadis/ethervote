import { useState, useEffect } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
import NotInit from "../../components/NotInit";
const Election_ABI = require("../../utils/Election.json");
import { BsFillFileLock2Fill } from "react-icons/bs";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas, faWallet, faAddressCard, faCheckToSlot } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Menambahkan ikon ke library FontAwesome
library.add(fas, fab, faWallet, faAddressCard, faCheckToSlot);

export default function AddCandidate() {

    // Contract Address & ABI Election
    const contractAddress = "0x48996909d258fC788137f5620AE95Deb7b4f26A8";
    const contractABI = Election_ABI.abi;

    const [isAdmin, setisAdmin] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [elStarted, setelStarted] = useState(false);
    const [elEnded, setelEnded] = useState(false);
    const [candidateCount, setcandidateCount] = useState(0);
    const [candidates, setcandidates] = useState([]);
    const [header, setheader] = useState("");
    const [slogan, setslogan] = useState("");

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
                fetchCandidatesDetail();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const fetchCandidatesDetail = async () => {
        try {
            const cekCount = await electionInstance.getTotalCandidate();
            const totalCandidateCount = cekCount.toNumber();
            setcandidateCount(totalCandidateCount);

            // Loading Candidates details
            const loadedCandidates = [];

            for (let i = 1; i <= cekCount.toNumber(); i++) {
                const candidateIndex = i - 1;
                const candidate = await electionInstance.candidateDetails(candidateIndex);

                loadedCandidates.push({
                    id: candidate.candidateId.toNumber(),
                    header: candidate.header,
                    slogan: candidate.slogan,
                });
            }

            setcandidates(loadedCandidates);
        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
    };

    const updateHeader = (event) => {
        setheader(event.target.value)
    };
    const updateSlogan = (event) => {
        setslogan(event.target.value);
    };

    const addCandidate = async () => {
        try {
            const addCandidateTx = await electionInstance.addCandidate(header, slogan);

            await addCandidateTx.wait();
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    }

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
                                    <h1 className="text-3xl">Tambah Kandidat</h1>
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
                                            <div className="lg:-mt-20 h-screen flex w-full justify-center items-center">
                                                <div className="flex mf:flex-row flex-col">
                                                    <div className="flex flex-col items-start w-full flex-1 p-5">
                                                        <p className="text-dark font-semibold text-xl mb-5">[ Add a new candidate ]</p>
                                                        <p className="w-full text-xs text-gray mb-5">
                                                        This form allows you to add a candidate to the system. Please provide accurate information in the required fields to proceed.
                                                        </p>
                                                        <form className="form border border-gray border-opacity-20 shadow-sm p-5 bg-lightgray w-full">
                                                            <div className="mb-5">
                                                                <label className={`label-ac text-dark text-base font-medium`}>
                                                                    Header
                                                                    <input
                                                                        className={`input-ac w-full p-2 text-dark border-none text-sm rounded-sm`}
                                                                        type="text"
                                                                        placeholder="eg. Dadang"
                                                                        value={header}
                                                                        onChange={updateHeader}
                                                                    />
                                                                </label>
                                                            </div>
                                                            <div className="mb-5">
                                                                <label className={`label-ac text-dark text-base font-medium`}>
                                                                    Slogan
                                                                    <input
                                                                        className={`input-ac w-full p-2 text-dark border-none text-sm rounded-sm`}
                                                                        type="text"
                                                                        placeholder="eg. It is what it is"
                                                                        value={slogan}
                                                                        onChange={updateSlogan}
                                                                    />
                                                                </label>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="rounded-sm text-white w-full mt-5 p-3 bg-dark cursor-pointer hover:text-lime-500 transition duration-300 ease-in-out shadow-sm"
                                                                disabled={
                                                                    header.length < 3 || header.length > 21
                                                                }
                                                                onClick={addCandidate}
                                                            >
                                                                Add
                                                            </button>
                                                        </form>
                                                    </div>
                                                    <div className="flex flex-col flex-1 p-5">
                                                        <p className="text-dark font-semibold text-xl mb-5">[ Candidates List ]</p>
                                                        <p className="w-full text-xs text-gray mb-5">The candidate list shows all added candidates. The app is in beta and lacks a delete feature, ensure all data is accurate.</p>        
                                                        {candidateCount > 0 && (
                                                            <p className="text-gray font-medium mb-5">Total candidates: {candidateCount}</p>
                                                        )}
                                                        {loadAdded(candidates)}
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
                                                            <p className="text-white text-center text-base">[ <span className="text-crimson">The election has ended</span> ]</p>
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

export function loadAdded(candidates) {
    return (
        <div className="flex flex-col w-full">
            {candidates.length < 1 ? (
                <div className="flex flex-row justify-center items-center mb-5">
                    <FontAwesomeIcon icon="fa-solid fa-xmark" className="mr-1 text-crimson" />
                    <p className="text-base text-gray">No candidates added.</p>
                </div>
            ) : (
                <div className="container-list">
                    <table className="w-full border-collapse border border-gray border-opacity-50 text-left">
                        <thead className="bg-lightgray">
                            <tr>
                                <th className="border border-gray border-opacity-50 px-5 py-2 text-sm font-semibold">#</th>
                                <th className="border border-gray border-opacity-50 px-5 py-2 text-sm font-semibold">Header</th>
                                <th className="border border-gray border-opacity-50 px-5 py-2 text-sm font-semibold">Slogan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map((candidate) => (
                                <tr key={candidate.id}>
                                    <td className="border border-gray border-opacity-50 px-5 py-2 text-sm">{candidate.id}</td>
                                    <td className="border border-gray border-opacity-50 px-5 py-2 text-sm font-medium">{candidate.header}</td>
                                    <td className="border border-gray border-opacity-50 px-5 py-2 text-sm">{candidate.slogan}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
