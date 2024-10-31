import { useState, useEffect } from "react";
import { SiHiveBlockchain } from "react-icons/si";
import { BsInfoCircle } from "react-icons/bs";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
const Election_ABI = require("../utils/Election.json");
import { shortenAddress } from '../utils/shortenAddress';
import TypingEffect from '../components/TypingEffect';
// const shortenAddress = require("../utils/shortenAddress");

const companyCommonStyles =
    "min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-sm font-light text-white";

export default function Homes() {
    const [elStarted, setelStarted] = useState(false);
    const [elEnded, setelEnded] = useState(false);
    const [elDetails, setelDetails] = useState({});

    // Contract Address & ABI
    const contractAddress = "0x1d83567b3C0faea211B3CA076255cFA1e2423d34";
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
        <div className="flex w-full h-screen justify-center items-center">
            <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4">
                <div className="flex flex-1 justify-start items-start flex-col mf:mr-10">
                    <h1 className="text-3xl sm:text-5xl text-gray-900 py-1">
                        E-voting <br /> using Blockchain Technology
                    </h1>
                    {/* <p className="text-left mt-5 text-gray-900 font-light md:w-9/12 w-11/12 text-base">
                            Discover the exciting world of blockchain voting with EtherVote. Easily cast your votes and participate in secure elections using smart contract technology on the Ethereum blockchain.
                    </p> */}
                    <TypingEffect text="discover the exciting world of blockchain voting with EtherVote. Easily cast your votes and participate in secure elections using smart contract technology on the Ethereum blockchain." speed={30}/>
                </div>
            </div>
        </div>
    );
}
