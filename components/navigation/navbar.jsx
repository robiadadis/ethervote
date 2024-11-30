import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { HiMenuAlt4 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
const Election_ABI = require("../../utils/Election.json");

export default function Navbar() {

	// Contract Address & ABI
	const contractAddress = "0xC921AC0B40407418e07f5BE6595212f72268D686";		
	const contractABI = Election_ABI.abi;

	const [toggleMenu, settoggleMenu] = useState(false);
	const [isAdmin, setisAdmin] = useState(false);
	const { data: signer } = useSigner()
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
		}
	}, [signer]);

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
			const electionInstance = new ethers.Contract(contractAddress, contractABI, signer);

			try {
				const admin = await electionInstance.getAdmin();

				if (address === admin) {
					setisAdmin(true);
				} else {
					setisAdmin(false);
				}
			} catch (error) {
				console.error("Error checking admin:", error);
			}
		} else {
			console.warn("Signer not available. Ensure that a wallet is connected.");
		}
	}

	return (
		<nav className="sticky top-0 bg-white shadow-sm z-50 py-5">
			<div className="container">
				<div className="w-full flex justify-between">
					<div className="flex items-center">
						<a href="/"><p className="text-dark tracking-widest font-semibold">ETHERVOTE</p></a>
					</div>
					<div className="flex justify-end">
						<ul className="text-dark md:flex hidden list-none flex-row items-center flex-initial gap-5 pl-5">
							{isAdmin ?
								<>
									<li className="cursor-pointer hover:text-crimson transition duration-300 ease-in-out"><a href="/Verification">Verify User</a></li>
									<li className="cursor-pointer hover:text-crimson transition duration-300 ease-in-out"><a href="/AddCandidate">Add Candidate</a></li>
									<li className="cursor-pointer hover:text-crimson transition duration-300 ease-in-out"><a href="/Voting">Vote</a></li>
									<li className="cursor-pointer hover:text-crimson transition duration-300 ease-in-out"><a href="/Results">Result</a></li>
								</>
								: <>
									<li className="cursor-pointer font-medium hover:text-crimson transition duration-300 ease-in-out"><a href="/Registration">Register</a></li>
									<li className="cursor-pointer font-medium hover:text-crimson transition duration-300 ease-in-out"><a href="/Voting">Vote</a></li>
									<li className="cursor-pointer font-medium hover:text-crimson transition duration-300 ease-in-out"><a href="/Results">Result</a></li>
								</>
							}
							<li className="cursor-pointer"><ConnectButton></ConnectButton></li>
						</ul>
						<div className="flex relative">
							{/* Hamburger Menu */}
							{!toggleMenu && (
								<HiMenuAlt4 fontSize={24} className="text-dark md:hidden cursor-pointer" onClick={() => settoggleMenu(true)} />
							)}
							{toggleMenu && (
								<ul className="z-10 fixed -top-0 -right-0 p-0 w-[60vw] h-screen shadow-xl md:hidden bg-dark text-white animate-slide-in pt-40 pl-10">
									<AiOutlineClose fontSize={24} className="text-dark md:hidden cursor-pointer bg-white border absolute top-5 right-5" onClick={() => settoggleMenu(false)} />
									{isAdmin ?
										<>
											<li className="cursor-pointer mb-3">
												<a href="/Verification" className="hover:text-crimson transition duration-300 ease-in-out">Verify User</a>
											</li>
											<li className="cursor-pointer mb-3">
												<a href="/AddCandidate" className="hover:text-crimson transition duration-300 ease-in-out">Add Candidate</a
											></li>
											<li className="cursor-pointer mb-3">
												<a href="/Registration" className="hover:text-crimson transition duration-300 ease-in-out">Register</a>
											</li>
											<li className="cursor-pointer mb-3">
												<a href="/Voting" className="hover:text-crimson transition duration-300 ease-in-out">Vote</a>
											</li>
											<li className="cursor-pointer mb-3">
												<a href="/Results" className="hover:text-crimson transition duration-300 ease-in-out">Result</a>
											</li>
										</>
										: <>
											<li className="cursor-pointer mb-3">
												<a href="/Registration" className="hover:text-crimson transition duration-300 ease-in-out">Register</a>
											</li>
											<li className="cursor-pointer mb-3">
												<a href="/Voting" className="hover:text-crimson transition duration-300 ease-in-out">Vote</a>
											</li>
											<li className="cursor-pointer mb-3">
												<a href="/Results" className="hover:text-crimson transition duration-300 ease-in-out">Result</a>
											</li>
										</>
									}
									<li className="cursor-pointer mt-7">
										<ConnectButton></ConnectButton>
									</li>
								</ul>
							)}
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}
