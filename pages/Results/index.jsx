import { useState, useEffect, useRef } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
import NotInit from "../../components/NotInit";
import { Chart } from "chart.js/auto";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas, faWallet, faAddressCard, faCheckToSlot } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const Election_ABI = require("../../utils/Election.json");

// Menambahkan ikon ke library FontAwesome
library.add(fas, fab, faWallet, faAddressCard, faCheckToSlot);


export default function Voting() {

    const contractAddress = "0x48996909d258fC788137f5620AE95Deb7b4f26A8";
    const contractABI = Election_ABI.abi;

    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [elStarted, setElStarted] = useState(false);
    const [elEnded, setElEnded] = useState(false);
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
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true,
                            }
                        }
                    ]
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
            let maxVoteRecived = 0;
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

                if (candidateData.voteCount > maxVoteRecived) {
                    maxVoteRecived = candidateData.voteCount;
                    winnerCandidate = candidateData;
                }
            }

            setCandidates(loadedCandidates);
            setWinner(winnerCandidate);

        } catch (error) {
            console.error("Error fetching candidates:", error);
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
                    <div className="min-h-screen">
                        <div className="gradient-bg-transactions">
                            {isLoading ? (
                                <div className="loader">
                                    <center className='text-white'>Loading...</center>
                                </div>
                            ) : (
                                <>
                                    {!elStarted && !elEnded ? (
                                        <NotInit />
                                    ) : elStarted && !elEnded ? (
                                        <div className="item-center">
                                            {candidates.length < 1 ? (
                                                <div className="loader">
                                                    <center className='text-white'>No candidates.</center>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="loader">
                                                        <div className='flex w-full justify-center items-center'>
                                                            <h3 className='text-white'>Temporary Results | Total candidates: {candidates.length}</h3>
                                                        </div>
                                                        <div className="flex justify-center items-center w-3/4 mx-auto ">
                                                            <div style={{ maxWidth: '100%', width: '100%' }}>
                                                                <canvas ref={canvasRef} id="myChart" height={200}></canvas>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : elEnded ? (
                                        <div className="item-center">
                                            {candidates.length < 1 ? (
                                                <div className="loader">
                                                    <center className='text-white'>No candidates.</center>
                                                </div>
                                            ) : (
                                                <>
                                                    {winner && (
                                                        <div className="container-main">
                                                            <div className="flex flex-col items-center justify-center p-5 text-center">
                                                                <div className="text-2xl font-bold text-red-500">Winner!</div>
                                                                <div className="text-xl font-bold mt-2 text-white">{winner.header}</div>
                                                                <div className="text-base mt-2 text-white">{winner.slogan}</div>
                                                                <div className="flex mt-5">
                                                                    <div className="text-sm font-medium mr-2 text-white">Total Votes:</div>
                                                                    <div className="text-sm font-medium text-red-500">{winner.voteCount}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-center items-center w-3/4 mx-auto ">
                                                        <div style={{ maxWidth: '100%', width: '100%' }}>
                                                            <canvas ref={canvasRef} id="myChart" height={200}></canvas>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </div>
                    </div>
                </>)}
        </>
    );
}
