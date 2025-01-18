import React from "react";

// FontAwesome Library
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas, faWallet, faAddressCard, faCheckToSlot } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
library.add(fas, fab, faWallet, faAddressCard, faCheckToSlot);

// Guide Card Component
const GuideCard = ({ title, icon, subtitle }) => (
    <div className="flex flex-row justify-center items-center">
        <div className={`w-10 h-5 p-6 flex justify-center items-center bg-dark text-white rounded-sm shadow-sm`}>
            {icon}
        </div>
        <div className="flex flex-col py-5 pl-5">
            <p className="text-dark text-md font-medium">{title}</p>
            <p className="text-gray text-sm font-medium">{subtitle}</p>
        </div>
    </div>
);

// Guide Component
const Guide = () => (
    <div className="bg-lightgray px-5">
        <div className="container">
            <div className="flex mf:flex-row mf:items-center flex-col py-20">
                <div className="flex-1 flex flex-col max-xl:mb-5">
                    <h1 className="text-dark text-xl font-medium">
                        How to use Ethervote
                    </h1>
                    <p className="text-gray text-sm font-medium">
                        Simply connect your wallet, register, and cast your vote.
                    </p>
                </div>
                {/* Guide Card */}
                <div className="flex-1 flex flex-col justify-start items-center">
                    <GuideCard
                        title="Connect Wallet"
                        icon={<FontAwesomeIcon icon={faWallet} />}
                        subtitle="Connect your wallet. You can use Metamask or other injected wallet. Make sure connect on Sepolia Testnet Network (Ethereum)."
                    />
                    <GuideCard
                        title="Register as Voter"
                        icon={<FontAwesomeIcon icon={faAddressCard} />}
                        subtitle="Fill out the form to register as a voter, then wait until admins verify your account before you can start casting your vote."
                    />
                    <GuideCard
                        title="Vote Candidate"
                        icon={<FontAwesomeIcon icon={faCheckToSlot} />}
                        subtitle="Enjoy casting your vote once your account has been approved by the admin. Make the right decision when voting for your candidate."
                    />
                </div>
            </div>
        </div>
    </div>
);

export default Guide;
