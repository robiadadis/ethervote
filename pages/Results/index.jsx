import { useState, useEffect, useRef } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
import NotInit from "../../components/NotInit";
const Election_ABI = require("../../utils/Election.json");

// Chart Result
import { Chart } from "chart.js/auto";

// FontAwesome Library
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas, faWallet, faAddressCard, faCheckToSlot } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
library.add(fas, fab, faWallet, faAddressCard, faCheckToSlot);

export default function Voting() {
    // Contract Address & ABI
    const contractAddress = "0x30b495eE242e534B0FFAb49Ae0B6D0Fc8A55aAe0";
    const contractABI = Election_ABI.abi;

    // Chart Result
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [elStarted, setElStarted] = useState(false);
    const [elEnded, setElEnded] = useState(false);
    const [elDetails, setelDetails] = useState({});
    const [candidateCount, setCandidateCount] = useState(0);
    const [candidates, setCandidates] = useState([]);
    const [winner, setWinner] = useState(null);

    const { data: signer } = useSigner();
    const [currentAccount, setCurrentAccount] = useState(null);

    const { address, isDisconnected } = useAccount({
        onDisconnect() {
            setCurrentAccount(null);
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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");

            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const data = {
                labels: candidates.map(c => c.header),
                datasets: [
                    {
                        label: "Votes",
                        data: candidates.map(c => c.voteCount),
                        backgroundColor: [
                            "rgba(255, 99, 132, 0.2)",
                            "rgba(54, 162, 235, 0.2)",
                            "rgba(255, 206, 86, 0.2)",
                            "rgba(75, 192, 192, 0.2)",
                            "rgba(153, 102, 255, 0.2)",
                            "rgba(255, 159, 64, 0.2)"
                        ],
                        borderColor: [
                            "rgba(255, 99, 132, 1)",
                            "rgba(54, 162, 235, 1)",
                            "rgba(255, 206, 86, 1)",
                            "rgba(75, 192, 192, 1)",
                            "rgba(153, 102, 255, 1)",
                            "rgba(255, 159, 64, 1)"
                        ],
                        borderWidth: 1
                    }
                ]
            };
            const options = {
                responsive: true, // Responsive
                maintainAspectRatio: false, // Height Flexible
                scales: {
                    y: {
                        beginAtZero: true, // Start Y axis from 0
                        ticks: {
                            stepSize: 1 // Y Axis
                        }
                    },
                    x: {
                        ticks: {
                            autoSkip: true,
                            maxRotation: 45,
                            minRotation: 0,
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: "top"
                    }
                }
            };
            chartRef.current = new Chart(ctx, {
                type: "bar",
                data: data,
                options: options
            });
        } else {
            console.error("canvas didn't exist");
        }
    }, [candidates]);

    const electionInstance = new ethers.Contract(contractAddress, contractABI, signer);

    const checkIfWalletConnected = async () => {
        try {
            if (!isDisconnected) {
                setCurrentAccount(address);
            } else {
                setCurrentAccount(null);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const checkStart = async () => {
        try {
            setIsLoading(true);
            const start = await electionInstance.getStart();
            setElStarted(start);
            const end = await electionInstance.getEnd();
            setElEnded(end);
            if (start === true || end === true) {
                await fetchCandidatesDetail();
            }

            fetchElectionDetail();
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }

    const fetchCandidatesDetail = async () => {
        try {
            const cekCount = await electionInstance.getTotalCandidate();
            const totalCandidateCount = cekCount.toNumber();
            setCandidateCount(totalCandidateCount);

            const loadedCandidates = [];
            let maxVoteReceived = 0;
            let winnerCandidate = null;

            for (let i = 1; i <= totalCandidateCount; i++) {
                const candidateIndex = i - 1;
                const candidate = await electionInstance.candidateDetails(candidateIndex);

                const candidateData = {
                    id: candidate.candidateId.toNumber(),
                    header: candidate.header,
                    slogan: candidate.slogan,
                    voteCount: candidate.voteCount.toNumber(),
                };

                loadedCandidates.push(candidateData);

                if (candidateData.voteCount > maxVoteReceived) {
                    maxVoteReceived = candidateData.voteCount;
                    winnerCandidate = candidateData;
                }
            }

            setCandidates(loadedCandidates);
            setWinner(winnerCandidate);

        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
    };

    const fetchElectionDetail = async () => {
        try {
            const electionTitle = await electionInstance.getElectionTitle();

            setelDetails({
                electionTitle: electionTitle,
            });
        } catch (error) {
            console.error(error);
        }
    }

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
                    {!elStarted && !elEnded ? (
                        <NotInit />
                    ) : elStarted && !elEnded ? (
                        <div className="container h-screen">
                            {candidates.length < 1 ? (
                                <div className="-mt-20 h-screen flex justify-center items-center">
                                    <div className="flex items-center justify-center bg-dark py-5 px-10 rounded-sm shadow-sm">
                                        <FontAwesomeIcon icon="fa-solid fa-xmark" className="text-crimson mr-1"/>
                                        <p className="text-white">No candidates.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col justify-center items-center p-5 mt-5">
                                        <p className="text-dark font-semibold text-xl mb-5">[ Temporary Results ]</p>
                                        <p className="w-full text-xs text-gray mb-5 text-center">
                                        Temporary results provide an overview of the current vote counts for all candidates. These results are updated in real-time to help you stay informed. Please remember, the results are temporary and may change as voting continues.
                                        </p>
                                        <p className="text-gray font-medium">Total candidates: {candidates.length}</p>
                                    </div>
                                    <div className="flex justify-center items-center px-5" style={{ height: "calc(100% - 280px)" }}>
                                        <div style={{ width: "100%", height: "100%" }}>
                                            <canvas ref={canvasRef} id="myChart" style={{ width: "100%", height: "100%" }}></canvas>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : elEnded ? (
                        <div className="container h-screen">
                            {candidates.length < 1 ? (
                                <div className="-mt-20 h-screen flex justify-center items-center">
                                    <div className="flex items-center justify-center bg-dark py-5 px-10 rounded-sm shadow-sm">
                                        <FontAwesomeIcon icon="fa-solid fa-xmark" className="text-crimson mr-1"/>
                                        <p className="text-white">No candidates.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {winner && (
                                        <div className="flex flex-col justify-center items-center px-5 mt-10">
                                            <div className="text-dark font-semibold text-xl text-center">
                                                [ <span className="text-dark">Congratulations to the winner of {elDetails.electionTitle}!</span> ]
                                            </div>
                                            <div className="text-lg font-semibold text-crimson mt-5">{winner.header}</div>
                                            <div className="text-sm font-medium text-dark text-center mb-5">"{winner.slogan}"</div>
                                            <p className="text-gray font-medium">Total votes received: {winner.voteCount}</p>
                                        </div>
                                    )}
                                    <div className="flex justify-center items-center px-5" style={{ height: "calc(100% - 280px)" }}>
                                        <div style={{ width: "100%", height: "100%" }}>
                                            <canvas ref={canvasRef} id="myChart" style={{ width: "100%", height: "100%" }}></canvas>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : null}   
                </>)}
        </>
    );
}
