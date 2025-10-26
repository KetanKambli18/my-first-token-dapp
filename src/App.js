import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import tokenABI from "./abi/token.json";
import "./index.css";

const contractAddress = "0x0742bf287De450b85e26B4bb592FF0C9C12ABcC3"; // paste your token address here

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }
      const [acc] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(acc);
      getBalance(acc);
    } catch (err) {
      console.error("Wallet connect error:", err);
      setMessage("❌ Wallet connection failed.");
    }
  };

  const getBalance = async (addr) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, tokenABI, provider);
      const balance = await contract.balanceOf(addr);
      setBalance(ethers.formatUnits(balance, 18));
    } catch (err) {
      console.error("Balance error:", err);
      setMessage("⚠️ Unable to fetch balance. Check contract or network.");
    }
  };

  const sendTokens = async (e) => {
    e.preventDefault();
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, tokenABI, signer);

      const tx = await contract.transfer(
        recipient,
        ethers.parseUnits(amount, 18)
      );
      setMessage("⏳ Sending tokens...");
      await tx.wait();
      setMessage(`✅ Sent ${amount} tokens successfully!`);
      getBalance(account);
      setRecipient("");
      setAmount("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Transaction failed!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6">
      <div className="p-8 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">🚀 My Token DApp</h1>

        {!account ? (
          <button
            onClick={connectWallet}
            className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-100 transition"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <p className="mt-4 text-sm break-words">
              Wallet: <span className="font-semibold">{account}</span>
            </p>
            <p className="mt-2 text-lg">
              Balance: <span className="font-semibold">{balance}</span> Tokens
            </p>

            <form onSubmit={sendTokens} className="flex flex-col mt-6 space-y-3">
              <input
                type="text"
                placeholder="Recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full p-3 rounded-lg text-gray-800 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 rounded-lg text-gray-800 focus:outline-none"
              />
              <button
                type="submit"
                className="py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition"
              >
                Send Tokens
              </button>
            </form>
          </>
        )}

        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </div>
  );
}

export default App;
