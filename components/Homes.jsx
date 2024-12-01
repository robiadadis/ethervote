import { useState, useEffect } from "react";
import { SiHiveBlockchain } from "react-icons/si";
import { BsInfoCircle } from "react-icons/bs";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
const Election_ABI = require("../utils/Election.json");
import Typewriter from 'typewriter-effect';
import Footer from "./navigation/footer";

const companyCommonStyles =
    "min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-sm font-light text-white";

export default function Homes() {
    const [elStarted, setelStarted] = useState(false);
    const [elEnded, setelEnded] = useState(false);
    const [elDetails, setelDetails] = useState({});
    const [showTypewriter, setShowTypewriter] = useState(false);
    
    // Contract Address & ABI
    const contractAddress = "0xC921AC0B40407418e07f5BE6595212f72268D686";
    // const contractAddress = "0xF70C3A67FDF9E2ddE0412817b0d938cC01c3767e";
    const contractABI = Election_ABI.abi;
    const { data: signer } = useSigner();
    const [currentAccount, setcurrentAccount] = useState("");

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

    useEffect(() => {
        setShowTypewriter(true);
    }, []);

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

    const checkStart = async () => {
        try {
            const start = await electionInstance.getStart();
            setelStarted(start);
            const end = await electionInstance.getEnd();
            setelEnded(end);
            if (start === true) {
                fetchElectionDetail();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const fetchElectionDetail = async () => {
        try {
            const adminName = await electionInstance.getAdminName();
            const adminEmail = await electionInstance.getAdminEmail();
            const adminTitle = await electionInstance.getAdminTitle();
            const electionTitle = await electionInstance.getElectionTitle();
            const organizationTitle = await electionInstance.getOrganizationTitle();

            setelDetails({
                adminName: adminName,
                adminEmail: adminEmail,
                adminTitle: adminTitle,
                electionTitle: electionTitle,
                organizationTitle: organizationTitle,
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="container">
            <div className="flex h-screen justify-center items-center -mt-20">
                <div className="md:w-2/3">
                    <div className="">
                        <h1 className="pb-2 border-b text-slate-300">
                            <span className="text-sm text-white bg-dark border p-1 px-2">Ethervote</span><span className="text-sm text-dark p-1 px-2">| E-voting using Blockchain Technology</span>
                        </h1>
                        <p className="text-left mt-5 text-gray font-medium">
                                Discover the exciting world of blockchain voting with Ethervote. Easily cast your votes and participate in secure elections using smart contract technology on ethereum blockchain.
                        </p>
                        <p className="mt-5 text-sm font-medium">
                            <>
                                {showTypewriter && (
                                    <Typewriter
                                        options={{
                                            strings: ["Reliability", "Security", "Web 3.0", "Ethereum", "Blockchain", "Low Fees"],
                                            autoStart: true,
                                            loop: true,
                                            typeSpeed: 100,
                                            deleteSpeed: 50,
                                        }}
                                    />
                                )}
                            </>
                        </p>
                    </div>
                </div>
            </div>
            <div className="relative">
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-7 w-7 text-dark animate-bounce">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>
            <div className="border-t"></div>
            <p className="text-dark font-medium text-center mb-3 mt-20">Admin & Election Details</p>
            <div className="flex justify-center">
                <div className="w-full md:w-1/2 flex flex-row justify-center items-center border">
                    <p className="text-dark text-sm p-3 text-center">
                        Admin Email : {elDetails?.adminEmail ? elDetails.adminEmail : "-"} | 
                        Election Title : {elDetails?.electionTitle ? elDetails.electionTitle : "-"}
                    </p>
                </div>
            </div>
            <div className="flex justify-center mb-10">
                <div className="w-full bg-dark md:w-1/2">
                    <p className="p-5 text-white text-center">
                        Election Status : {elStarted ? (
                            <span className="text-lime-500 animate-pulse">Started</span>
                        ) : (
                            <span className="text-crimson animate-pulse">Not Started</span>
                        )}
                    </p>
                </div>
            </div>
            <div className="flex justify-center mb-20">
                <p className="w-full md:w-1/2 text-center text-xs text-gray">Note: If you encounter any issues or difficulties during the voting process, please contact the responsible admin immediately for further assistance.</p>
            </div>
        </div>
    );
}
