import { useState, useEffect } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
const Election_ABI = require("../utils/Election.json");
import { useForm } from "react-hook-form";

export default function AdminHomes() {
    const [elStarted, setelStarted] = useState(false);
    const [elEnded, setelEnded] = useState(false);
    const [elDetails, setelDetails] = useState({});

    // Contract Address & ABI
    const contractAddress = "0xE8F42d39476B67Ab201D4E1fE76b2178787918f3";
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
    };

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
    };

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
    };

    const endElection = async () => {
        const endTx = await electionInstance.endElection();
        await endTx.wait();
        setelEnded(true); // Set elEnded to true when the election ends
    };

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
        <div className="container h-screen -mt-20 flex justify-center items-center">
            {elEnded ? (
                <div className="shadow-sm">
                    <div className="bg-dark p-5 border">
                        <p className="text-white text-center text-base">[ <span className="text-crimson animate-pulse">The election has ended</span> ]</p>
                    </div>
                    <div className="p-8 border">
                        <p className="text-dark text-sm">Re-deploy the contract to start election again.</p>
                    </div>
                </div>
            ) : !elStarted ? (
                <form onSubmit={handleSubmit(registerElection)} className="border border-gray border-opacity-20 shadow-sm p-10 bg-lightgray">
                    <p className="text-left font-semibold text-lg">Admin & Election Setup Form</p>
                    <p className="text-xs text-gray">Set up admin details and election details.</p>
                    <div className="border-b border-gray border-opacity-50 my-5"></div>
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

                    <button
                        type="submit"
                        className="text-white w-full mt-5 p-2 bg-dark cursor-pointer hover:text-lime-500 transition duration-300 ease-in-out"
                    >
                        Start Election
                    </button>
                </form>
            ) : (
                <div className="w-full">
                    <p className="text-dark font-medium text-center mb-3 mt-20">Admin & Election Details</p>
                    <div className="flex justify-center">
                        <div className="w-full md:w-1/2 flex flex-row justify-center items-center border">
                            <p className="text-dark text-sm p-3 text-center">
                                Admin Email : {elDetails?.adminEmail || "-"} | Election Title :{" "}
                                {elDetails?.electionTitle || "-"}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-center mb-5">
                        <div className="w-full bg-dark md:w-1/2">
                            <p className="p-5 text-white text-center">
                                Election Status :{" "}
                                {elStarted ? (
                                    <span className="text-lime-500 animate-pulse">Started</span>
                                ) : (
                                    <span className="text-crimson animate-pulse">Not Started</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <div className="w-full border-t md:w-1/2 my-5"></div>
                        <p className="w-full text-center text-xs text-gray md:w-1/2"><span className="text-crimson">Warning</span>: Ending the election will close all voting sessions, lock the final results, and prevent any further changes from voters. Ensure that all votes have been recorded and reviewed before proceeding. This action cannot be undone.</p>
                        <button
                            type="button"
                            onClick={endElection}
                            className="text-white w-full mt-5 bg-dark cursor-pointer md:w-1/4 p-3 shadow-md hover:text-crimson transition duration-300 ease-in-out"
                        >
                            <span className="">END ELECTION</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
