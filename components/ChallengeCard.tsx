import React, { useState } from 'react';
import { Challenge, ChallengeTask } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { TokenIcon } from './icons/TokenIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ChallengeCardProps {
  challenge: Challenge;
  onToggleTask: (challengeId: number, taskId: number) => void;
  onDelete: (challengeId: number, taskId: number) => void;
  isClaimed: boolean;
  onClaim: (challenge: Challenge) => void;
  isJustClaimed: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onToggleTask, onDelete, isClaimed, onClaim, isJustClaimed }) => {
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  
  const completedTasks = challenge.tasks.filter(t => t.isCompleted).length;
  const totalTasks = challenge.tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isComplete = totalTasks > 0 && completedTasks === totalTasks;
  const isClaimable = isComplete && !isClaimed;

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
      <div className="p-6">
        <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
        <p className="text-sm text-gray-400 mt-1">{challenge.description}</p>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-semibold text-gray-300">Progress</p>
            <p className="text-sm font-bold text-white">{completedTasks}/{totalTasks}</p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-700 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-4 divide-y divide-gray-800">
          {challenge.tasks.map(task => (
            <div key={task.id} className="group">
              <div 
                onClick={() => {
                    if (task.details) {
                        setExpandedTaskId(prevId => (prevId === task.id ? null : task.id));
                    }
                }}
                className={`w-full flex items-center gap-3 text-left py-4 ${task.details ? 'cursor-pointer' : ''}`}
              >
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if (!task.isCompleted) {
                            onToggleTask(challenge.id, task.id); 
                        }
                    }}
                    disabled={task.isCompleted}
                    className="flex-shrink-0"
                    aria-label={`Mark task as ${task.isCompleted ? 'completed' : 'incomplete'}`}
                >
                    {task.isCompleted ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500 animate-checkmark-pop" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-600 rounded-full"></div>
                    )}
                </button>
                <p className={`flex-grow text-sm transition-colors duration-300 ${task.isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                  {task.description}
                </p>
                {task.details && (
                   <ChevronDownIcon className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${expandedTaskId === task.id ? 'rotate-180' : ''}`} />
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(challenge.id, task.id); }}
                  className="p-2 -mr-2 text-gray-500 rounded-full hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Delete task: ${task.description}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
              </div>
              <div
                id={`task-details-${task.id}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedTaskId === task.id ? 'max-h-40' : 'max-h-0'}`}
              >
                  <div className="pb-4 pr-4 pl-9">
                      <p className="text-sm text-gray-300">{task.details}</p>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-black/30 px-6 py-4">
        <p className="text-xs font-bold text-white tracking-wider">REWARD</p>
        <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 bg-black border border-white rounded-md flex items-center justify-center">
                <TokenIcon className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-white">+{challenge.reward.amount} {challenge.reward.currency}</p>
        </div>
      </div>

      <div className="p-4">
        <button 
          onClick={() => onClaim(challenge)}
          disabled={!isClaimable}
          className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg transition-all duration-200 ${
            isClaimed 
                ? `bg-green-600 text-white cursor-default ${isJustClaimed ? 'animate-claim-success' : ''}`
                : isClaimable 
                ? 'bg-white text-blue-600 hover:scale-105'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          aria-label={isClaimable ? `Claim reward for ${challenge.title}` : `Reward for ${challenge.title} is locked`}
        >
          {isClaimed ? (
            <>
              <CheckIcon className="w-5 h-5" />
              Reward Claimed
            </>
          ) : isClaimable ? (
            'Claim Reward'
          ) : (
            <>
              <LockClosedIcon className="w-5 h-5" />
              Claim Reward
            </>
          )}
        </button>
      </div>
    </div>
  );
};
