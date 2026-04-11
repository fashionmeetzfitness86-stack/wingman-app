import React from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { mockTokenTransactions as tokenTransactions } from '../data/mockData';

const TransactionRow: React.FC<(typeof tokenTransactions)[0]> = ({ type, amount, reason, date, time }) => {
    const isAdd = type === 'add';
    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAdd ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isAdd ? <PlusIcon className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>}
                </div>
                <div>
                    <p className="font-bold text-white">{isAdd ? '+' : '-'}{amount} TMKC</p>
                    <p className="text-sm text-gray-400">{reason}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-semibold text-white">{date}</p>
                <p className="text-sm text-gray-500">{time}</p>
            </div>
        </div>
    );
}

export const TokenHistoryPage: React.FC = () => {
  return (
    <div className="p-4 md:p-8 animate-fade-in text-white">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Transactions</h1>
            <button className="flex items-center gap-2 text-gray-300 font-semibold">
                Filter
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>
            </button>
        </div>
        <div className="divide-y divide-gray-800">
            {tokenTransactions.map((tx, i) => <TransactionRow key={i} {...tx} />)}
        </div>
    </div>
  );
};
