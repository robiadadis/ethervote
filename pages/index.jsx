import { useState, useEffect } from "react";
import Guide from "../components/Guide";
import Homes from "../components/Homes";
import AdminHomes from "../components/AdminHomes";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
const Election_ABI = require("../utils/Election.json");

export default function Home() {
	// Contract Address & ABI
	const contractAddress = "0xe81ebd830831CE5a1A018F713eE439400B19DBB2";
	const contractABI = Election_ABI.abi;

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
		if (signer) {
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

	return (
		<div className="min-h-screen">
			<div className="gradient-bg-welcome">
				{isAdmin ? (
					<>
						<AdminHomes />
					</>
				) : (
					<>
						<Homes />
					</>
				)}
			</div>
			{!isAdmin && <Guide />}
		</div>
	);
}
