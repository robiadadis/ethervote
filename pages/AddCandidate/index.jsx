import { useState, useEffect } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
import NotInit from "../../components/NotInit";
const Election_ABI = require("../../utils/Election.json");
import { BsFillFileLock2Fill } from "react-icons/bs";

export default function AddCandidate() {

    // Contract Address & ABI Election
    const contractAddress = "0x6DCb89Ab5586886de2554c774c9C73a16DAD2511";
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
                            <div className="min-h-screen">
                                <div className="gradient-bg-services loader">
                                    {!elStarted && !elEnded ? (
                                        <NotInit />
                                    ) : elStarted && !elEnded ? (
                                        <>
                                            <div className='flex w-full justify-center items-center'>
                                                <div className='flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4'>
                                                    <div className='flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10'>
                                                        <div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10">
                                                            <h2 className='text-xl sm:text-3xl text-white text-gradient py-1'>Tambah Kandidat Baru</h2>
                                                            <small className='text-white'>Jumlah Kandidat: {candidateCount}</small>
                                                            <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
                                                                <form className="form">
                                                                    <div className="mb-3">
                                                                        <label className={`label-ac text-white`}>
                                                                            Nama Kandidat
                                                                            <input
                                                                                className={`input-ac my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white border-none text-sm white-glassmorphism`}
                                                                                type="text"
                                                                                placeholder="eg. Dadang"
                                                                                value={header}
                                                                                onChange={updateHeader}
                                                                            />
                                                                        </label>
                                                                    </div>
                                                                    <div className="mb-3">
                                                                        <label className={`label-ac text-white`}>
                                                                            Slogan
                                                                            <input
                                                                                className={`input-ac my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white border-none text-sm white-glassmorphism`}
                                                                                type="text"
                                                                                placeholder="eg. It is what it is"
                                                                                value={slogan}
                                                                                onChange={updateSlogan}
                                                                            />
                                                                        </label>
                                                                    </div>
                                                                    <button
                                                                        type='button'
                                                                        className="text-white w-full mt-2 border-[1px] p-2 border-[#fffff0] hover:bg-[#ff0000] rounded-full cursor-pointer"
                                                                        disabled={
                                                                            header.length < 3 || header.length > 21
                                                                        }
                                                                        onClick={addCandidate}
                                                                    >
                                                                        Tambah
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {loadAdded(candidates)}
                                                </div>
                                            </div>
                                        </>
                                    ) : !elStarted && elEnded ? (
                                        <>
                                            <div className="flex w-full justify-center items-center">
                                                <div className="flex mf:flex-row flex-col items-start justify-between md:p-10 py-6 px-2">
                                                    <div className="flex flex-1 justify-start items-start flex-col mf:mr-10">
                                                        <center>
                                                            <h3 className='text-white'>Pemilihan sudah berakhir.</h3>
                                                            <button className='text-white w-full mt-2 border-[1px] p-2 border-[#fffff0] hover:bg-[#ff0000] rounded-full cursor-pointer'>
                                                                <a
                                                                    to="/Results"
                                                                    className='text-white'
                                                                >
                                                                    Lihat hasil
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
                        </>
                    )}
                </>)}
        </>
    );
}

export function loadAdded(candidates) {
    const renderAdded = (candidate) => {
        return (
            <>
                <div className="container-list success">
                    <div>
                        {candidate.id}. <strong>{candidate.header}</strong>:{" "}
                        {candidate.slogan}
                    </div>
                </div>
            </>
        );
    };
    return (
        <div className='flex w-full justify-center items-center'>
            <div className='flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4'>
                <div className='flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10'>
                    <div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10">
                        <h4 className='text-xl sm:text-3xl text-white text-gradient py-1'>Daftar kandidat yang sudah ditambahkan</h4>
                        {candidates.length < 1 ? (
                            <h6 className='text-xl text-white py-1'>No candidates added.</h6>
                        ) : (
                            <div className='text-white'>
                                {candidates.map(renderAdded)}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}