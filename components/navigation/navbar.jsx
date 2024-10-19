import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { HiMenuAlt4 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
const Election_ABI = require("../../utils/Election.json");

export default function Navbar() {

	// Contract Address & ABI
	const contractAddress = "0x1d83567b3C0faea211B3CA076255cFA1e2423d34";		
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
		<nav className="sticky top-0 backdrop-blur-md shadow-sm z-50 py-5">
			<div className="container">
				<div className="w-full flex justify-between">
					<div className="flex items-center">
						<a href="/"><p className="text-dark tracking-widest font-semibold">ETHERVOTE</p></a>
					</div>
					<div className="flex justify-end">
						<ul className="text-dark md:flex hidden list-none flex-row items-center flex-initial gap-5 pl-5">
							{isAdmin ?
								<>
									<li className="cursor-pointer"><a href="/Verification">Verifikasi User</a></li>
									<li className="cursor-pointer"><a href="/AddCandidate">Tambah Kandidat</a></li>
									<li className="cursor-pointer"><a href="/Voting">Voting</a></li>
									<li className="cursor-pointer"><a href="/Results">Hasil</a></li>
								</>
								: <>
									<li className="cursor-pointer font-medium"><a href="/Registration">Registrasi</a></li>
									<li className="cursor-pointer font-medium"><a href="/Voting">Voting</a></li>
									<li className="cursor-pointer font-medium"><a href="/Results">Hasil</a></li>
								</>
							}
							<li className="cursor-pointer"><ConnectButton></ConnectButton></li>
						</ul>
						<div className="flex relative">
							{/* Hamburger Menu */}
							{!toggleMenu && (
								<HiMenuAlt4 fontSize={28} className="text-dark md:hidden cursor-pointer border" onClick={() => settoggleMenu(true)} />
							)}
							{toggleMenu && (
								<ul className="z-10 fixed -top-0 -right-2 p-3 w-[70vw] h-screen shadow-2xl md:hidden list-none flex flex-col justify-start items-end rounded-md blue-glassmorphism text-dark animate-slide-in"
								>
									<AiOutlineClose fontSize={28} className="text-dark md:hidden cursor-pointer" onClick={() => settoggleMenu(false)} />
									{isAdmin ?
										<>
											<li className="cursor-pointer"><a href="/Verification">Verifikasi</a></li>
											<li className="cursor-pointer"><a href="/AddCandidate">Tambah Kandidat</a></li>
											<li className="cursor-pointer"><a href="/Registration">Registrasi</a></li>
											<li className="cursor-pointer"><a href="/Voting">Voting</a></li>
											<li className="cursor-pointer"><a href="/Results">Hasil</a></li>
										</>
										: <>
											<li className="cursor-pointer"><a href="/Registration">Regitrasi</a></li>
											<li className="cursor-pointer"><a href="/Voting">Voting</a></li>
											<li className="cursor-pointer"><a href="/Results">Hasil</a></li>
										</>
									}
									<li className="cursor-pointer"><ConnectButton></ConnectButton></li>
								</ul>
							)}
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}
