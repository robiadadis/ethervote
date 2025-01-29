import { useState, useEffect } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
const Election_ABI = require("../utils/Election.json");
import { useForm } from "react-hook-form";

// Notification Message Library
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminHomes() {
    const [elStarted, setelStarted] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [elEnded, setelEnded] = useState(false);
    const [elDetails, setelDetails] = useState({});

    // Contract Address & ABI
    const contractAddress = "0xe81ebd830831CE5a1A018F713eE439400B19DBB2";
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
        try{
            // Loader
			setisLoading(true);
        
            // Start Tx
            const endTx = await electionInstance.endElection()
            await endTx.wait();
            
            // If Tx Success
            toast.success("Transaction confirmed. Election successfully ended!");

            window.location.reload();
        } catch (error) {
			console.error(error);
			toast.error("User rejected transaction.");
		} finally {
			// Stop Loader
			setisLoading(false);
		}
    };

    const registerElection = async (data) => {
        try{
            // Loader
			setisLoading(true);
        
            // Start Tx
            const registElectionTx = await electionInstance.setElectionDetails(
                data.adminFName.toLowerCase() + " " + data.adminLName.toLowerCase(),
                data.adminEmail.toLowerCase(),
                data.adminTitle.toLowerCase(),
                data.electionTitle.toLowerCase(),
                data.organizationTitle.toLowerCase()
            );
            await registElectionTx.wait();
    
            // If Tx Success
            toast.success("Transaction confirmed. Election registration successful!");
            
            window.location.reload();
        } catch (error) {
			console.error(error);
			toast.error("User rejected transaction");
		} finally {
			// Stop Loader
			setisLoading(false);
		}
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
        return <span style={{ color: "#dd2d4a" }}>{props.msg}</span>;
    };

    return (
        <div className="container h-screen -mt-20 flex justify-center items-center">
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
            {elEnded ? (
                <div className="shadow-sm">
                    <div className="bg-dark p-5 border">
                        <p className="text-white text-center text-base">[ <span className="text-crimson text-lg">The election has ended</span> ]</p>
                    </div>
                    <div className="p-5 border">
                        <p className="text-dark text-base">Re-deploy the contract to start election again.</p>
                    </div>
                </div>
            ) : !elStarted ? (
                <div className="p-5 mt-5">
                    <form onSubmit={handleSubmit(registerElection)} className="border border-gray border-opacity-20 shadow-sm p-10 bg-lightgray">
                        <p className="text-center text-dark font-semibold text-lg">[ Admin & Election Setup Form ]</p>
                        <p className="text-xs text-gray text-center">Set up admin details and election details.</p>
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
                                                    className="w-full p-2 text-dark border-none text-sm rounded-sm"
                                                    type="text"
                                                    placeholder="First Name"
                                                    {...register("adminFName", {
                                                        required: true,
                                                    })}
                                                />
                                                <input
                                                    className="w-full p-2 text-dark border-none text-sm rounded-sm"
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
                                                className="w-full p-2 text-dark border-none text-sm shadow-sm mb-2 rounded-sm"
                                                placeholder="eg. Name@example.com"
                                                name="adminEmail"
                                                {...register("adminEmail", {
                                                    required: "*required",
                                                    pattern: {
                                                        value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, // email validation using RegExp
                                                        message: "*Invalid",
                                                    },
                                                })}
                                            />
                                        </label>

                                        <label className="text-dark text-sm">
                                            Position{" "}
                                            {errors.adminTitle && <EMsg msg="*required" />}
                                            <input
                                                className="w-full p-2 text-dark border-none text-sm shadow-sm mb-2 rounded-sm"
                                                type="text"
                                                placeholder="eg. Developer "
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
                                                className="w-full p-2 text-dark border-none text-sm shadow-sm mb-2 rounded-sm"
                                                type="text"
                                                placeholder="eg. Leadership Election"
                                                {...register("electionTitle", {
                                                    required: true,
                                                })}
                                            />
                                        </label>
                                        <label className="text-dark text-sm">
                                            Organization{" "}
                                            {errors.organizationTitle && <EMsg msg="*required" />}
                                            <input
                                                className="w-full p-2 text-dark border-none text-sm shadow-sm mb-2 rounded-sm"
                                                type="text"
                                                placeholder="eg. Ethervote"
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
                            className="text-lime-500 w-full mt-5 p-3 bg-dark cursor-pointer hover:text-lime-600 transition duration-300 ease-in-out rounded-sm shadow-sm"
                            disabled={
                                isLoading
                            }
                        >
                            {isLoading ? (
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
                            ) : (
                                <p className="font-semibold">Start Election</p>
                            )}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="w-full p-5">
                    <p className="text-dark font-semibold text-xl mb-5 text-center">[ Admin & Election Details ]</p>
                    <div className="flex justify-center">
                        <div className="w-full md:w-1/2 flex flex-row justify-center items-center border">
                            <p className="text-dark text-base font-medium p-5 text-center">
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
                        <div className="w-full border-t border-gray border-opacity-50 md:w-1/2 mb-5"></div>
                        <p className="w-full text-center text-xs text-gray md:w-1/2"><span className="text-crimson">Warning</span>: Ending the election will close all voting sessions, lock the final results, and prevent any further changes from voters. Ensure that all votes have been recorded and reviewed before proceeding. This action cannot be undone.</p>
                        <button
                            type="button"
                            onClick={endElection}
                            className="text-crimson w-full mt-5 bg-dark cursor-pointer md:w-1/4 p-3 shadow-md hover:text-red-800 transition duration-300 ease-in-out rounded-sm"
                            disabled={
                                isLoading
                            }
                        >
                            {isLoading ? (
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
                            ) : (
                                <p className="font-semibold">[ END ELECTION ]</p>
                            )}
                        </button>
                        <p className="w-full text-center text-xs text-gray md:w-1/2 mt-5">Note: Election cannot end with equal or zero vote count.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
