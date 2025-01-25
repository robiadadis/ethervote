import { useState, useEffect } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
const Election_ABI = require("../../utils/Election.json");
import CryptoJS from 'crypto-js';
import NotInit from "../../components/NotInit";
import { useForm } from "react-hook-form";

// FontAwesome Library
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas, faWallet, faAddressCard, faCheckToSlot } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
library.add(fas, fab, faWallet, faAddressCard, faCheckToSlot);

// Notification Message
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Encrypt data using AES Encryption
function encryptData(data, secretKey) {
	const ciphertext = CryptoJS.AES.encrypt(data, secretKey).toString();
	return ciphertext;
};

// Decrypt data using AES Decryption
function decryptData(ciphertext, secretKey) {
	const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
	const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
	return decryptedData;
};

export default function Registration() {
	// Contract Address & ABI
	const contractAddress = "0x30b495eE242e534B0FFAb49Ae0B6D0Fc8A55aAe0";
	const contractABI = Election_ABI.abi;

	const [isLoading, setisLoading] = useState(false);
	const [elStarted, setelStarted] = useState(false);
	const [elEnded, setelEnded] = useState(false);
	const [voterName, setvoterName] = useState("");
	const [voterPhone, setvoterPhone] = useState("");
	const [currentVoter, setcurrentVoter] = useState({
		address: undefined,
		name: null,
		phone: null,
		hasVoted: false,
		isVerified: false,
		isRegistered: false,
	});
	const [secretKey, setsecretKey] = useState(process.env.NEXT_PUBLIC_SECRET_KEY);
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
			}
		} catch (error) {
			console.error(error);
		}
	}

	const fetchCurrentVoter = async () => {
		try {
			const voter = await electionInstance.voterDetails(address);

			const decryptedName = decryptData(voter.name, secretKey);
			const decryptedPhone = decryptData(voter.phone, secretKey);

			setcurrentVoter({
				address: voter.voterAddress,
				name: decryptedName,
				phone: decryptedPhone,
				hasVoted: voter.hasVoted,
				isVerified: voter.isVerified,
				isRegistered: voter.isRegistered,
			});

		} catch (error) {
			console.error(error);
		}
	}

	const registerAsVoter = async () => {
		try {
			// Loader
			setisLoading(true);

			// Start Tx
			const encryptedName = encryptData(voterName, secretKey);
			const encryptedPhone = encryptData(voterPhone, secretKey);
			const registTx = await electionInstance.registerAsVoter(encryptedName, encryptedPhone);

			await registTx.wait();

			// If Tx Success
			toast.success("Transaction confirmed. Your voter details have been successfully registered or updated!");

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

	const updateVoterName = (event) => {
		setvoterName(event.target.value);
	}

	const updateVoterPhone = (event) => {
		setvoterPhone(event.target.value);
	}

	const EMsg = (props) => {
        return <span className="text-xs text-crimson">{props.msg}</span>;
    };

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
					<div className="container lg:-mt-20 my-14">
						{!elStarted && !elEnded ? (
							// Loader
							<>
								<NotInit />
							</>
						) : elStarted && !elEnded ? (
							<>
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
								<div className="h-screen flex justify-center items-center">
									<div className="flex mf:flex-row flex-col">
										{/* Registration Form */}
										<div className="flex flex-col flex-1 p-5">
											<p className="text-dark font-semibold text-xl mb-5">[ Registration Form ]</p>
											<p className="w-full text-xs text-gray mb-5">
												This registration form is designed to collect user information. Please fill in all the required fields, such as name and phone number.
											</p>
											<form onSubmit={handleSubmit(registerAsVoter)} className="border border-gray border-opacity-20 shadow-sm p-5 bg-lightgray w-full">
												<div className="mb-5">
													<label className={`form-label`}>
														<span className="text-dark text-base font-medium">
															Wallet Address
														</span>
														<input
															className="form-control w-full p-2 text-dark border-none text-sm rounded-sm"
															type="text"
															value={currentAccount}
															readOnly
														/>
													</label>
												</div>
												<div className="mb-5">
													<label className={`form-label`}>
														<span className="text-dark text-base font-medium">Name</span>
														{errors.voterName && <EMsg msg=" *required" />}
														<input
															className="form-control w-full p-2 text-dark border-none text-sm rounded-sm"
															type="text"
															placeholder="eg. yourname"
															{...register("voterName", { 
																required: true, 
															})}
															value={voterName}
															onChange={updateVoterName}
														/>
													</label>
												</div>
												<div className="mb-3">
													<label className="form-label text-dark">
														<span className="text-dark text-base font-medium">Phone</span>
														{errors.voterPhone && <EMsg msg=" *Phone number must be between 12 and 13 digits" />}
														<input
															className="form-control w-full p-2 text-dark border-none text-sm rounded-sm"
															type="number"
															placeholder="eg. 6289123456789"
															{...register("voterPhone", {
																required: true,
																validate: (value) =>
																value.toString().length >= 12 && value.toString().length <= 13 || 
																"Phone number must be between 12 and 13 digits",
															})}
															value={voterPhone}
															onChange={updateVoterPhone}
														/>
													</label>
												</div>
												<button
													type="submit"
													className="rounded-sm text-lime-500 w-full mt-5 p-3 bg-dark cursor-pointer hover:text-lime-600 transition duration-300 ease-in-out shadow-sm"
													disabled={
														currentVoter.isVerified || 
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
													) : currentVoter.isVerified ? (
														<FontAwesomeIcon icon="fa-solid fa-ban" className="text-crimson text-lg"/>
													) : currentVoter.isRegistered ? (
														<p className="font-semibold">Update</p>
													) : (
														<p className="font-semibold">Register</p>
													)}
												</button>
											</form>
										</div>
										{/* End Registration Form */}

										{/* Details Registration */}
										<div className="flex flex-1 p-5">
											{loadCurrentVoter(
												currentVoter,
												currentVoter.isRegistered
											)}
										</div>
										{/* End Details Registration */}
									</div>
								</div>
							</>
							) : !elStarted && elEnded ? (
								<>
									<div className="container -mt-20 w-full p-5">
										<div className="h-screen flex justify-center flex-col items-center">
											<div className="lg:w-1/2 shadow-sm">
												<div className="bg-dark p-5 border">
													<p className="text-white text-center text-lg">[ <span className="text-crimson">The election has ended</span> ]</p>
												</div>
												<div className="p-5 border">
													<p className="text-dark text-base text-center">The election period has officially ended. All votes have been securely recorded and verified using the blockchain-based e-voting system. To view the final results, please click the button below.</p>
												</div>
											</div>
											<div className="flex justify-center mt-10 mb-2">
												<FontAwesomeIcon icon="fa-solid fa-caret-down" className="animate-bounce"/>
											</div>
											<div className="flex justify-center">
												<button className="text-dark hover:text-gray transition duration-300 ease-in-out text-baseq font-medium bg-lime-400 cursor-pointer py-3 px-5 shadow-sm rounded-sm">
													<a
														href="/Results"
														className="text-center font-semibold"
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
				</>)}
		</>
	);
}

export function loadCurrentVoter(voter, isRegistered) {
	return (
		<>
			<div className="flex flex-col items-start w-full">
				<p className="text-dark font-semibold text-xl mb-5">
					[ Your Registered Info ]
				</p>
				<p className="w-full text-xs text-gray mb-5">
					This section displays the information you have registered in the system. It includes details such as wallet address, name, phone, and account status.
				</p>
				<div className="w-full">
					<table className="w-full text-center shadow-sm">
						<tr className="bg-lightgray">
							<th className="border border-gray border-opacity-20 text-dark text-base font-medium p-2">Wallet Address</th>
							<td className="border border-gray border-opacity-20 text-dark p-2">
								<div className="flex justify-center">
									<div className="overflow-x-auto max-w-[250px] md:max-w-[none] w-full">
										<span className="text-dark text-sm">
											{voter.address}
										</span>
									</div>
								</div>
							</td>
						</tr>
						<tr className="bg-white">
							<th className="border border-gray border-opacity-20 text-dark text-base font-medium p-2">Name</th>
							<td className="border border-gray border-opacity-20 text-dark text-sm p-2">{voter.name && voter.name.trim() !== "" ? voter.name : "-"}
							</td>
						</tr>
						<tr className="bg-lightgray">
							<th className="border border-gray border-opacity-20 text-dark text-base font-medium p-2">Phone</th>
							<td className="border border-gray border-opacity-20 text-dark text-sm p-2">{voter.phone && voter.phone.trim() !== "" ? voter.phone : "-"}</td>
						</tr>
						<tr className="bg-white">
							<th className="border border-gray border-opacity-20 text-dark text-base font-medium p-2">Registered</th>
							<td
								className={`border border-gray border-opacity-20 text-sm font-medium p-2 ${
									voter.isRegistered ? "text-lime-500" : "text-crimson"
								}`}
								>
								{voter.isRegistered ? "True" : "False"}
							</td>
						</tr>
						<tr className="bg-lightgray">
							<th className="border border-gray border-opacity-20 text-dark text-base font-medium p-2">Verification</th>
							<td
								className={`border border-gray border-opacity-20 text-sm font-medium p-2 ${
									voter.isVerified ? "text-lime-500" : "text-crimson"
								}`}
								>
								{voter.isVerified ? "True" : "False"}
							</td>
						</tr>
						<tr className="bg-white">
							<th className="border border-gray border-opacity-20 text-dark text-base font-medium p-2">Voted</th>
							<td
								className={`border border-gray border-opacity-20 text-sm font-medium p-2 ${
									voter.hasVoted ? "text-lime-500" : "text-crimson"
								}`}
								>
								{voter.hasVoted ? "True" : "False"}
							</td>
						</tr>
					</table>
				</div>
				<p className="w-full text-xs text-gray mt-5">
					<span className="text-crimson">Note</span>: Admin might not approve your account if the provided phone number does not match the account address registered in the admin's catalog. Additionally, if your account has already been verified by the admin, you will not be able to update your data again.
				</p>
			</div>
		</>
	);
}