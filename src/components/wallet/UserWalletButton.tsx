"use client";

import React, { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import walletService from "@/lib/wallet/walletService";
import UserWalletModal from "./UserWalletModal";

interface UserWalletButtonProps {
  onBalanceUpdate: (amount: number) => void;
  currentBalance: number;
}

const UserWalletButton: React.FC<UserWalletButtonProps> = ({
  onBalanceUpdate,
  currentBalance,
}) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isCrossmarkInstalled, setIsCrossmarkInstalled] = useState<
    boolean | null
  >(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check wallet status on mount
  useEffect(() => {
    const checkWallet = async () => {
      await walletService.initialize();
      setIsCrossmarkInstalled(walletService.isCrossmarkInstalled());
      setIsWalletConnected(await walletService.isWalletConnected());
    };

    checkWallet();
  }, []);

  const handleOpenModal = async () => {
    if (isCrossmarkInstalled && !isWalletConnected) {
      setIsLoading(true);
      try {
        const connected = await walletService.connectWallet();
        if (connected) {
          setIsWalletConnected(true);
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Open modal regardless of connection state
    setShowModal(true);
  };

  return (
    <>
      {/* Improved button that matches the StatusBar components */}
      <button
        onClick={handleOpenModal}
        disabled={isLoading}
        className="group h-full px-3 py-1.5 rounded-lg bg-blue-800/50 border border-blue-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-blue-800/70 hover:border-blue-600/50 flex items-center gap-2"
      >
        <Wallet size={14} className="text-blue-400" />
        <div>
          <span className="text-gray-400 text-xs">XRP</span>
          <div className="text-sm">
            {isCrossmarkInstalled === false ? (
              <span className="text-blue-400">Install Wallet</span>
            ) : isWalletConnected ? (
              <span className="text-green-400 flex items-center gap-1">
                Connected
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
              </span>
            ) : isLoading ? (
              <span className="text-gray-300">Connecting...</span>
            ) : (
              <span>Connect</span>
            )}
          </div>
        </div>
      </button>

      {/* Render modal when shown */}
      {showModal && (
        <UserWalletModal
          isOpen={showModal}
          onModalClose={() => setShowModal(false)}
          onBalanceUpdate={onBalanceUpdate}
          currentBalance={currentBalance}
          onConnectionChange={(connected) => setIsWalletConnected(connected)}
        />
      )}
    </>
  );
};

export default UserWalletButton;
