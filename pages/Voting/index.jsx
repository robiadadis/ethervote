import { useState, useEffect } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
import NotInit from "../../components/NotInit";
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

export default function Voting() {
    // Contract Address & ABI
    const contractAddress = "0xe81ebd830831CE5a1A018F713eE439400B19DBB2";
    const contractABI = Election_ABI.abi;

    const [isLoading, setisLoading] = useState(false);
    const [loadingCandidateId, setLoadingCandidateId] = useState(null);
    const [elStarted, setelStarted] = useState(false);
    const [elEnded, setelEnded] = useState(false);
    const [candidateCount, setcandidateCount] = useState(0);
    const [candidates, setcandidates] = useState([]);
    const [currentVoter, setcurrentVoter] = useState({
        address: undefined,
        name: null,
        phone: null,
        hasVoted: false,
        isVerified: false,
        isRegistered: false,
    });

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

    const checkStart = async () => {
        try {
            const start = await electionInstance.getStart();
            setelStarted(start);
            const end = await electionInstance.getEnd();
            setelEnded(end);
            if (start === true) {
                fetchCurrentVoter();
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


    const fetchCurrentVoter = async () => {
        try {
            const voter = await electionInstance.voterDetails(address);

            setcurrentVoter({
                address: voter.voterAddress,
                name: voter.name,
                phone: voter.phone,
                hasVoted: voter.hasVoted,
                isVerified: voter.isVerified,
                isRegistered: voter.isRegistered,
            });

        } catch (error) {
            console.error(error);
        }
    }

    const castVote = async (id) => {
        try {
            // Loader
            setLoadingCandidateId(id);

            // Start Tx
            const castVoteTx = await electionInstance.vote(id);
            await castVoteTx.wait();
    
            // If Tx Success
            toast.success("Transaction confirmed. Your vote has been cast successfully!");
            
            window.location.reload();
        } catch (error) {
			console.error(error);
            // If Tx Cancelled
			toast.error("User rejected transaction.");
		} finally {
            // Stop Loader
            setLoadingCandidateId(null);
        }
    };

    const confirmVote = (id, header) => {
        const r = window.confirm(
            `Vote for ${header} with Id ${id + 1}.\nAre you sure?`
        );
        if (r === true) {
            castVote(id);
        }
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
                    <div className="">
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
                                    <div className="flex flex-col w-full items-center min-h-screen px-5">
                                        {currentVoter.isRegistered ? (
                                            currentVoter.isVerified ? (
                                                currentVoter.hasVoted ? (
                                                    <div className="w-full shadow-sm my-10">
                                                        <div className="w-full flex flex-col justify-center items-center bg-lightgray p-5 shadow-sm">
                                                            <div className="flex flex-col lg:flex-row items-center">
                                                                <FontAwesomeIcon icon="fa-solid fa-square-check" className="text-lime-500 lg:mr-2 mb-2 lg:mb-0"/>
                                                                <p className="font-medium text-sm text-dark text-center">You've casted your vote securely through the blockchain-based system. You can view the current voting results by clicking the button below.</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-lightgray bg-opacity-50 p-5 flex justify-center">
                                                            <button className="text-dark font-medium  cursor-pointer hover:text-lime-500 transition duration-300 ease-in-out">
                                                                <FontAwesomeIcon icon="fa-solid fa-square-poll-vertical" className="mr-1"/>
                                                                <a
                                                                    href="/Results"
                                                                >
                                                                     See results 
                                                                </a>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full flex flex-row justify-center items-center bg-lightgray p-5 my-10 shadow-sm">
                                                        <FontAwesomeIcon icon="fa-solid fa-check-to-slot" className="text-lime-500 mr-2"/>
                                                        <p className='font-medium text-sm text-dark text-center'>Go ahead and cast your vote.</p>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="w-full flex lg:flex-row flex-col justify-center items-center bg-lightgray p-5 my-10 shadow-sm">
                                                    <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" className="text-crimson lg:mr-2"/>
                                                    <p className="font-medium text-sm text-dark text-center">You are currently unable to vote. Admin verification is required to activate your voting privileges. Thank you for your patience.</p>
                                                </div>
                                            )
                                        ) : (
                                            <>
                                                <div className="w-full flex sm:flex-row flex-col justify-center items-center bg-lightgray p-5 my-10 shadow-sm">
                                                    <FontAwesomeIcon icon="fa-solid fa-xmark" className="text-crimson mr-2"/>
                                                    <p className="font-medium text-sm text-dark text-center">You're not registered. Please complete your registration to proceed.</p>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex flex-col items-start justify-between pb-5"> 
                                            <div className="w-full flex flex-col items-center justify-start">
                                                <p className="text-dark font-semibold text-xl">[ Candidate List ]</p>
                                                <p className="text-gray font-medium">Total candidates: {candidateCount}</p>
                                                <p className="text-gray text-sm text-center pt-5 pb-10">Please cast your vote carefully, as once submitted, your choice will be final and cannot be undone. Ensure you review your decision thoroughly before confirming your vote.</p>
                                                {candidateCount < 1 ? (
                                                    <div className="flex flex-row justify-center items-center mt-5">
                                                        <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" className="mr-1 text-yellow-400"/>
                                                        <p className="text-base font-medium text-dark">There is no candidate available to vote for yet.</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-row flex-wrap justify-center gap-5 py-10 border-t border-gray border-opacity-50">
                                                        <>
                                                            {candidates.map(candidate => (
                                                                <div key={candidate.id} className="p-5 lg:w-96 w-full flex flex-col justify-start items-center border border-dark border-opacity-50 shadow-sm bg-lightgray">
                                                                    <div className="flex flex-row items-center">
                                                                        <p className="text-dark font-medium">#{candidate.id + 1} {candidate.header}</p>
                                                                    </div>
                                                                    <p className="text-dark overflow-x-auto h-14 my-5 border-y w-full text-center p-1 bg-white border-gray border-opacity-20 text-base rounded-sm">{candidate.slogan}</p>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => confirmVote(candidate.id, candidate.header)}
                                                                        className="text-lime-500 w-full cursor-pointer bg-dark p-3 rounded-sm shadow-sm hover:text-lime-600 transition duration-300 ease-in-out"
                                                                        disabled={
                                                                            !currentVoter.isRegistered ||
                                                                            !currentVoter.isVerified ||
                                                                            currentVoter.hasVoted ||
                                                                            isLoading
                                                                        }
                                                                    >
                                                                        {loadingCandidateId === candidate.id ? (
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
                                                                        ) : !currentVoter.isRegistered || !currentVoter.isVerified || currentVoter.hasVoted ? (
                                                                            <FontAwesomeIcon icon="fa-solid fa-ban" className="text-crimson text-lg"/>
                                                                        ) : (
                                                                            <span className="font-semibold">Vote</span>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </>
                                                    </div>
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
                    </div>
                </>)}
        </>
    );
}