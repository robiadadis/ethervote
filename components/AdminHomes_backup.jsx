import { useState, useEffect } from "react";
import { SiHiveBlockchain } from "react-icons/si";
import { BsInfoCircle } from "react-icons/bs";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
const Election_ABI = require("../utils/Election.json");
import { shortenAddress } from '../utils/shortenAddress';
// const shortenAddress = require("../utils/shortenAddress");
import { useForm } from "react-hook-form";
import Homes from "./Homes";

export default function AdminHomes() {

    const [elStarted, setelStarted] = useState(false);
    const [elEnded, setelEnded] = useState(false);
    const [elDetails, setelDetails] = useState({});

    // Contract Address & ABI
    const contractAddress = "0x946081373B0B9Bf607adeA11339CF3E4D867FDBA";
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

    // end election
    const endElection = async () => {
        const endTx = await electionInstance.endElection()
        
        await endTx.wait();

        window.location.reload();
    };
    // register and start election
    const registerElection = async (data) => {
        const registElectionTx = await electionInstance.setElectionDetails(
                data.adminFName.toLowerCase() + " " + data.adminLName.toLowerCase(),
                data.adminEmail.toLowerCase(),
                data.adminTitle.toLowerCase(),
                data.electionTitle.toLowerCase(),
                data.organizationTitle.toLowerCase()
        );
        
        await registElectionTx.wait();

        window.location.reload();
    };

    // Contains of Home page for the Admin
    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        registerElection(data);
    };

    const EMsg = (props) => {
        return <span style={{ color: "tomato" }}>{props.msg}</span>;
    };

    return (
        <div className="h-screen -mt-20 flex justify-center items-center">
            <form onSubmit={handleSubmit(onSubmit)} className="border border-gray border-opacity-20 shadow-sm p-10 bg-lightgray">
                <p className="text-left font-semibold text-lg">Admin & Election Setup Form</p>
                <p className="text-xs text-gray">Set up admin details and election details.</p>
                <div className="border-b border-gray border-opacity-50 my-5"></div>
                {!elStarted & !elEnded ? (
                    <div className="sm:w-96 w-full flex flex-col justify-start items-center">
                        {/* about-admin */}
                        <div className="about-admin">
                            <p className="text-dark font-medium">About Admin</p>
                            <div className="">
                                <div>
                                    <label className="text-dark text-sm">
                                        Full Name{" "}
                                        {errors.adminFName && <EMsg msg="*required" />}
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                className="w-full p-2 text-dark border-none text-sm"
                                                type="text"
                                                placeholder="First Name"
                                                {...register("adminFName", {
                                                    required: true,
                                                })}
                                            />
                                            <input
                                                className="w-full p-2 text-dark border-none text-sm"
                                                type="text"
                                                placeholder="Last Name"
                                                {...register("adminLName")}
                                            />
                                        </div>
                                    </label>

                                    <label className="text-dark text-sm">
                                        Email{" "}
                                        {errors.adminEmail && (
                                            <EMsg msg={errors.adminEmail.message} />
                                        )}
                                        <input
                                            className="w-full p-2 text-dark border-none text-sm shadow-sm mb-2"
                                            placeholder="eg. you@example.com"
                                            name="adminEmail"
                                            {...register("adminEmail", {
                                                required: "*Required",
                                                pattern: {
                                                    value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, // email validation using RegExp
                                                    message: "*Invalid",
                                                },
                                            })}
                                        />
                                    </label>

                                    <label className="text-dark text-sm">
                                        Job Title or Position{" "}
                                        {errors.adminTitle && <EMsg msg="*required" />}
                                        <input
                                            className="w-full p-2 text-dark border-none text-sm shadow-sm mb-2"
                                            type="text"
                                            placeholder="eg. HR Head "
                                            {...register("adminTitle", {
                                                required: true,
                                            })}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="w-full border-b border-gray border-opacity-50 my-5"></div>
                        {/* about-election */}
                        <div className="about-election">
                            <p className="text-dark font-medium">About Election</p>
                            <div className="">
                                <div>
                                    <label className="text-dark text-sm">
                                        Election Title{" "}
                                        {errors.electionTitle && <EMsg msg="*required" />}
                                        <input
                                            className="w-full p-2 text-dark border-none text-sm shadow-sm mb-2"
                                            type="text"
                                            placeholder="eg. School Election"
                                            {...register("electionTitle", {
                                                required: true,
                                            })}
                                        />
                                    </label>
                                    <label className="text-dark text-sm">
                                        Organization Name{" "}
                                        {errors.organizationTitle && <EMsg msg="*required" />}
                                        <input
                                            className="w-full p-2 text-dark border-none text-sm shadow-sm mb-2"
                                            type="text"
                                            placeholder="eg. Lifeline Academy"
                                            {...register("organizationTitle", {
                                                required: true,
                                            })}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : elStarted ? (
                    <Homes el={elDetails} account={currentAccount} />
                ) : null}
                
                <div className="justify-center items-center">
                    {!elStarted ? (
                        <>
                            {!elEnded ? (
                                <>
                                    <div className="">
                                        <button type="submit" className="text-white w-full mt-5 p-2 bg-dark cursor-pointer hover:text-lime-500 transition duration-300 ease-in-out">
                                            Start Election {elEnded ? "Again" : null}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <h3 className="text-dark">Re-deploy the contract to start election again.</h3>
                            )}
                            {elEnded ? (
                                <center>
                                    <p className="text-dark">The election ended.</p>
                                </center>
                                
                            ) : null}
                        </>
                    ) : (
                        <>
                            <div className="flex w-full justify-center items-center">
                                <button
                                    type="button"
                                    onClick={endElection}
                                    className="text-white w-full mt-5 p-2 bg-dark cursor-pointer hover:text-lime-500 transition duration-300 ease-in-out"
                                >
                                    End
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </form>
        </div>
);
};