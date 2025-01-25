import { useState, useEffect } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
import NotInit from "../../components/NotInit";
import { useForm } from "react-hook-form";
const Election_ABI = require("../../utils/Election.json");

// FontAwesome Library
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas, faWallet, faAddressCard, faCheckToSlot } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
library.add(fas, fab, faWallet, faAddressCard, faCheckToSlot);

// Notification Message
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddCandidate() {
    // Contract Address & ABI
    const contractAddress = "0x30b495eE242e534B0FFAb49Ae0B6D0Fc8A55aAe0";
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

            const loadedCandidates = [];

            for (let i = 1; i <= cekCount.toNumber(); i++) {
                const candidateIndex = i - 1;
                const candidate = await electionInstance.candidateDetails(candidateIndex);

                loadedCandidates.push({
                    id: candidate.candidateId.toNumber() + 1,
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
            // Loader
			setisLoading(true);

			// Start Tx
            const addCandidateTx = await electionInstance.addCandidate(header, slogan);
            await addCandidateTx.wait();

            // If Tx Success
			toast.success("Transaction confirmed. Candidate added successfully!");

            window.location.reload();
        } catch (error) {
			console.error(error);
			toast.error("User rejected transaction");
		} finally {
			// Stop Loader
			setisLoading(false);
		}
    }

    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm();
    
    const EMsg = (props) => {
        return <span className="text-xs text-crimson">{props.msg}</span>;
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
                                <p className="text-dark font-medium text-lg mt-2 w-1/2 text-center">[ <span className="text-gray">Access to the add candidate page is restricted to admin only</span> ]</p>
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
                                        <div className="-mt-20 h-screen flex w-full justify-center items-center">
                                            <div className="flex mf:flex-row flex-col">
                                                <div className="flex flex-col items-start w-full flex-1 p-5">
                                                    <p className="text-dark font-semibold text-xl mb-5">[ Add a new candidate ]</p>
                                                    <p className="w-full text-xs text-gray mb-5">
                                                    This form allows you to add a candidate to the system. Please provide accurate information in the required fields to proceed.
                                                    </p>
                                                    <form onSubmit={handleSubmit(addCandidate)} className="form border border-gray border-opacity-20 shadow-sm p-5 bg-lightgray w-full">
                                                        <div className="mb-5">
                                                            <label className="label-ac text-dark text-base font-medium">
                                                                Header
                                                                {errors.header && <EMsg msg=" *required" />}
                                                                <input
                                                                    className="input-ac w-full p-2 text-dark border-none text-sm rounded-sm"
                                                                    type="text"
                                                                    placeholder="eg. Name"
                                                                    {...register("header", { 
                                                                        required: true, 
                                                                    })}
                                                                    value={header}
                                                                    onChange={updateHeader}
                                                                />
                                                            </label>
                                                        </div>
                                                        <div className="mb-5">
                                                            <label className="label-ac text-dark text-base font-medium">
                                                                Slogan
                                                                {errors.slogan && <EMsg msg=" *required" />}
                                                                <input
                                                                    className="input-ac w-full p-2 text-dark border-none text-sm rounded-sm"
                                                                    type="text"
                                                                    placeholder="eg. It is what it is"
                                                                    {...register("slogan", { 
                                                                        required: true, 
                                                                    })}
                                                                    value={slogan}
                                                                    onChange={updateSlogan}
                                                                />
                                                            </label>
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            className="rounded-sm text-lime-500 w-full mt-5 p-3 bg-dark cursor-pointer hover:text-lime-600 transition duration-300 ease-in-out shadow-sm"
                                                            disabled={
                                                                isLoading
                                                            }
                                                        >
                                                            {isLoading ? (
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
                                                                <p className="font-semibold">Add</p>
                                                            )}
                                                        </button>
                                                    </form>
                                                </div>
                                                <div className="flex flex-col flex-1 p-5">
                                                    <p className="text-dark font-semibold text-xl mb-5">[ Candidates List ]</p>
                                                    <p className="w-full text-xs text-gray mb-5">The candidate list shows all added candidates. The app is in beta and lacks a delete feature, ensure all data is accurate.</p>        
                                                    {candidateCount > 0 && (
                                                        <p className="2xl:mt-3.5 text-gray font-medium mb-5">Total candidates: {candidateCount}</p>
                                                    )}
                                                    {loadAdded(candidates)}
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

export function loadAdded(candidates) {
    return (
        <div className="flex flex-col w-full">
            {candidates.length < 1 ? (
                <div className="flex flex-row justify-center items-center mt-5">
                    <FontAwesomeIcon icon="fa-solid fa-xmark" className="mr-1 text-crimson" />
                    <p className="text-base text-gray">No candidates added.</p>
                </div>
            ) : (
                <div className="container-list">
                    <table className="border-collapse border border-gray border-opacity-50 text-left">
                        <thead className="bg-lightgray">
                            <tr>
                                <th className="text-center border border-gray border-opacity-50 px-5 py-2 text-sm font-semibold">#</th>
                                <th className="border border-gray border-opacity-50 px-5 py-2 text-sm font-semibold">Header</th>
                                <th className="w-full border border-gray border-opacity-50 px-5 py-2 text-sm font-semibold">Slogan</th>
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
