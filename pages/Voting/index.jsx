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
    const contractAddress = "0x946081373B0B9Bf607adeA11339CF3E4D867FDBA";
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
                                    {currentVoter.isRegistered ? (
                                        currentVoter.isVerified ? (
                                            currentVoter.hasVoted ? (
                                                <div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10">
                                                    <div>
                                                        <p className='text-dark font-bold'>You've casted your vote.</p>
                                                        <p />
                                                        <button className='text-white w-full mt-2 border-[1px] p-2 border-[#fffff0] hover:bg-[#ff0000] rounded-full cursor-pointer'>
                                                            <a
                                                                href="/Results"
                                                                style={{
                                                                    color: "white",
                                                                    textDecoration: "none",
                                                                }}
                                                            >
                                                                See Results
                                                            </a>
                                                        </button>
                                                        <p />
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
                                    <div className="flex w-full justify-center items-center border min-h-screen">
                                        <div className="flex mf:flex-row flex-col items-start justify-between md:p-10 py-6 px-2 border">
                                            <div className="w-full flex flex-col items-center justify-start border">
                                                <p className="text-dark font-semibold text-lg">[ Candidate List ]</p>
                                                <p className="text-dark">Total candidates: {candidateCount}</p>
                                                {candidateCount < 1 ? (
                                                    <div className="">
                                                        <center className='text-dark'>Not one to vote for.</center>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {candidates.map(candidate => (
                                                            <div key={candidate.id} className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
                                                                <p className="text-dark">{candidate.header}</p>
                                                                <small className='text-dark'>#{candidate.id}</small>
                                                                <p className="text-dark">{candidate.slogan}</p>
                                                                <button
                                                                    type='button'
                                                                    onClick={() => confirmVote(candidate.id, candidate.header)}
                                                                    className="text-dark w-full mt-2 border-[1px] p-2 border-[#fffff0] hover:bg-[#ff0000] rounded-full cursor-pointer"
                                                                    disabled={
                                                                        !currentVoter.isRegistered ||
                                                                        !currentVoter.isVerified ||
                                                                        currentVoter.hasVoted
                                                                    }
                                                                >
                                                                    Vote
                                                                </button>
                                                            </div>
                                                        ))}

                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : !elStarted && elEnded ? (
                                <>
                                    <div className="flex w-full justify-center items-center">
                                        <div className="flex mf:flex-row flex-col items-start justify-between md:p-10 py-6 px-2">
                                            <div className="flex flex-1 justify-start items-start flex-col mf:mr-10">
                                                <center>
                                                    <h3 className='text-dark'>The Election ended.</h3>
                                                    <button className='text-dark w-full mt-2 border-[1px] p-2 border-[#fffff0] hover:bg-[#ff0000] rounded-full cursor-pointer'>
                                                        <a
                                                            href="/Results"
                                                            className='text-white'
                                                        >
                                                            See results
                                                        </a>
                                                    </button>
                                                </center>
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