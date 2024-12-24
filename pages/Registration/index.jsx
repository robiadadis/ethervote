import { useState, useEffect } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
const Election_ABI = require("../../utils/Election.json");
import CryptoJS from 'crypto-js';
import NotInit from "../../components/NotInit";
import { useForm } from "react-hook-form";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas, faWallet, faAddressCard, faCheckToSlot } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Menambahkan ikon ke library FontAwesome
library.add(fas, fab, faWallet, faAddressCard, faCheckToSlot);


// Encrypt data using AES encryption
function encryptData(data, secretKey) {
	const ciphertext = CryptoJS.AES.encrypt(data, secretKey).toString();
	return ciphertext;
};

// Decrypt data using AES decryption
function decryptData(ciphertext, secretKey) {
	const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
	const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
	return decryptedData;
};

// Encrypt data using SHA-256 encryption
// function encryptData(data, secretKey) {
// 	const hash = CryptoJS.SHA256(data + secretKey).toString(); // Combine data with secretKey and hash
// 	return hash;
// };

// // Placeholder function for decryption (SHA-256 cannot be decrypted)
// function decryptData(ciphertext, secretKey) {
// 	console.log("SHA-256 is a one-way hash function. Decryption is not possible.");
// 	return null; // Return null since decryption isn't applicable for SHA-256
// };

export default function Registration() {

	// Contract Address & ABI
	const contractAddress = "0x946081373B0B9Bf607adeA11339CF3E4D867FDBA";
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
	const [secretKey, setsecretKey] = useState(process.env.NEXT_PUBLIC_SECRET_KEY || 'default_secret_key');
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
			const encryptedName = encryptData(voterName, secretKey);
			const encryptedPhone = encryptData(voterPhone, secretKey);
			const registTx = await electionInstance.registerAsVoter(encryptedName, encryptedPhone);

			setisLoading(true);
			await registTx.wait();

			window.location.reload();
			setisLoading(false);
		} catch (error) {
			console.error(error);
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
						<FontAwesomeIcon icon="fa-solid fa-lock" className="animate-bounce" />
						<p className="text-dark font-medium text-lg mt-1 ml-2">[ Please connect your wallet ]</p>
					</div>
				</>) :
				(<>
					<div className="">
						<div className="container lg:-mt-20">
							{!elStarted && !elEnded ? (
								// Loader
								<>
									<NotInit />
								</>
							) : elStarted && !elEnded ? (
								<>
									<div className="md:h-screen flex w-full justify-center items-center py-5">
										<div className="flex mf:flex-row flex-col justify-between">
											{/* Registration Form */}
											<div className="flex flex-col flex-1 items-start w-full p-5">
												<p className="text-dark font-semibold text-lg mb-5">[ Registration Form ]</p>
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
																className="form-control w-full p-2 text-dark border-none text-sm"
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
																className="form-control w-full p-2 text-dark border-none text-sm"
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
																className="form-control w-full p-2 text-dark border-none text-sm"
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
														className={`text-white w-full mt-5 p-3 bg-dark cursor-pointer hover:text-lime-500 transition duration-300 ease-in-out shadow-sm ${
															isLoading ? "opacity-70 cursor-not-allowed" : ""
														}`}
														disabled={
															currentVoter.isVerified || 
															isLoading
														}
													>
														{isLoading ? (
															<div className="flex items-center justify-center">
																<svg
																	className="animate-spin -mt-1 h-6 w-6 text-white inline-block"
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
														) : currentVoter.isRegistered ? (
															"Update"
														) : (
															"Register"
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
										<div className="flex w-full justify-center items-center">
											<div className="flex mf:flex-row flex-col items-start justify-between md:p-10 py-6 px-2">
												<div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10">
													<h2 className='className="text-3xl sm:text-5xl text-white text-gradient py-1'>Pemilihan telah berakhir</h2>
													<small className='text-white'>Lihat hasil pemilihan</small>
													<div className="container attention">
														<button className='text-white w-full mt-2 border-[1px] p-2 border-[#fffff0] hover:bg-[#ff0000] rounded-full cursor-pointer'>
															<a
																href="/Results"
																style={{
																	color: "white",
																	textDecoration: "none",
																}}
															>
																Lihat hasil
															</a>
														</button>
													</div>
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

export function loadCurrentVoter(voter, isRegistered) {
	return (
		<>
			<div className="flex flex-col items-start w-full">
				<p className="text-dark font-semibold text-lg mb-5">
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
					<span className="text-crimson">Note</span>: Admin might not approve your account if the provided phone number does not matches the account address registered in admins catalogue.
				</p>
			</div>
		</>
	);
}