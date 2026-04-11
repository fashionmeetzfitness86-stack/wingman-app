import React, { useState, useEffect } from 'react';
import { Page, Transaction } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TokenIcon } from './icons/TokenIcon';
import { SendIcon } from './icons/SendIcon';

interface TokenWalletPageProps {
  onNavigate: (page: Page) => void;
  transactions: Transaction[];
}

const TransactionRow: React.FC<Transaction> = ({ type, amount, reason, date, time, itemName }) => {
    const isAdd = type === 'add';
    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAdd ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isAdd ? <PlusIcon className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>}
                </div>
                <div>
                    <p className="font-bold text-white">{isAdd ? '+' : '-'}{amount} TMKC</p>
                    <p className="text-sm text-gray-400">{itemName || reason}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-semibold text-white text-sm">{date}</p>
                <p className="text-xs text-gray-500">{time}</p>
            </div>
        </div>
    );
}

export const TokenWalletPage: React.FC<TokenWalletPageProps> = ({ onNavigate, transactions }) => {
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const calculatedBalance = transactions.reduce((acc, tx) => {
            return tx.type === 'add' ? acc + tx.amount : acc - tx.amount;
        }, 0);
        setBalance(calculatedBalance);
    }, [transactions]);

    return (
        <div className="p-4 md:p-8 animate-fade-in text-white">
            <div className="bg-gradient-to-br from-amber-500/20 to-gray-900 border border-amber-400/30 rounded-xl p-6 text-center mb-8">
                <p className="text-sm font-semibold text-amber-300">Total Balance</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <TokenIcon className="w-8 h-8 text-amber-400" />
                    <p className="text-4xl font-bold text-white">{balance.toLocaleString()}</p>
                </div>
                <p className="text-gray-400 text-sm mt-1">TMKC Tokens</p>
                <div className="flex gap-4 mt-6">
                    <button className="w-full flex items-center justify-center gap-2 bg-amber-400 text-black font-bold py-3 px-4 rounded-lg">
                        <PlusIcon className="w-5 h-5"/> Buy Tokens
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 bg-gray-700/50 border border-gray-600 text-white font-bold py-3 px-4 rounded-lg">
                        <SendIcon className="w-5 h-5"/> Send
                    </button>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
                <div className="divide-y divide-gray-800">
                    {transactions.map((tx, i) => <TransactionRow key={i} {...tx} />)}
                </div>
            </div>
        </div>
    );
};
