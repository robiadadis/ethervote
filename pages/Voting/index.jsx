import { useState, useEffect } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
import NotInit from "../../components/NotInit";
const Election_ABI = require("../../utils/Election.json");
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas, faWallet, faAddressCard, faCheckToSlot } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Menambahkan ikon ke library FontAwesome
library.add(fas, fab, faWallet, faAddressCard, faCheckToSlot);

export default function Voting() {

    // Contract Address & ABI Election
    const contractAddress = "0x48996909d258fC788137f5620AE95Deb7b4f26A8";
    const contractABI = Election_ABI.abi;

    // CA & ABI PolyVote
    // const PolyCA = "0xa2207A9a09209541518CfF604f151Ecd8fBAEba4";
    // const PolyABI = PolyVote_ABI.abi;
    
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
        const castVoteTx = await electionInstance.vote(id);
        await castVoteTx.wait();

        // Refresh the page or update the state as needed
        window.location.reload();
    };

    const confirmVote = (id, header) => {
        const r = window.confirm(
            `Vote for ${header} with Id ${id}.\nAre you sure?`
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
                        <FontAwesomeIcon icon="fa-solid fa-lock" className="animate-bounce" />
                        <p className="text-dark font-medium text-lg mt-1 ml-2">[ Please connect your wallet ]</p>
                    </div>
                </>) :
                (<>
                    <div className="">
                        <div className="container">
                            {!elStarted && !elEnded ? (
                                <NotInit />
                            ) : elStarted && !elEnded ? (
                                <>
                                    <div className="flex flex-col w-full items-center min-h-screen">
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
                                                    <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" className="text-crimson animate-pulse lg:mr-2"/>
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
                                                <p className="text-dark font-semibold text-lg">[ Candidate List ]</p>
                                                <p className="text-gray font-medium">Total candidates: {candidateCount}</p>
                                                <div>
                                                    <p className="text-gray text-sm mt-5 text-center">Please cast your vote carefully, as once submitted, your choice will be final and cannot be undone. Ensure you review your decision thoroughly before confirming your vote.</p>
                                                </div>
                                                
                                                <div className="w-full border-t border-gray border-opacity-50 mt-10 mb-5"></div>
                                                {candidateCount < 1 ? (
                                                    <div className="flex flex-row justify-center items-center mt-5">
                                                        <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" className="mr-1 text-yellow-400"/>
                                                        <p className="text-base font-medium text-dark">There is no candidate available to vote for yet.</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-row flex-wrap justify-center gap-5 p-5">
                                                        <>
                                                            {candidates.map(candidate => (
                                                                <div key={candidate.id} className="p-5 sm:w-96 w-full flex flex-col justify-start items-center border border-dark border-opacity-50 shadow-sm bg-lightgray">
                                                                    <div className="flex flex-row items-center">
                                                                        <p className="text-dark font-medium">#{candidate.id} {candidate.header}</p>
                                                                    </div>
                                                                    <p className="text-dark overflow-x-auto h-14 my-5 border-y w-full text-center p-1 bg-white border-gray border-opacity-20 text-base">{candidate.slogan}</p>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => confirmVote(candidate.id, candidate.header)}
                                                                        className="text-lime-500 w-full cursor-pointer bg-dark p-3"
                                                                        disabled={
                                                                            !currentVoter.isRegistered ||
                                                                            !currentVoter.isVerified ||
                                                                            currentVoter.hasVoted
                                                                        }
                                                                    >
                                                                        <span className="">Vote</span>
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
                </>)}
        </>
    );
}