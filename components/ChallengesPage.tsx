import React, { useState, useEffect } from 'react';
import { Challenge, ChallengeTask } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { TokenIcon } from './icons/TokenIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ConfirmationModal } from './modals/ConfirmationModal';
import { TrashIcon } from './icons/TrashIcon';

interface ChallengesPageProps {
  challenges: Challenge[];
  onToggleTask: (challengeId: number, taskId: number) => void;
  onDeleteTask: (challengeId: number, taskId: number) => void;
  onRewardClaimed: (rewardAmount: number, challengeTitle: string) => void;
}

const ChallengeCard: React.FC<{
  challenge: Challenge;
  onToggleTask: (challengeId: number, taskId: number) => void;
  onDelete: (challengeId: number, taskId: number) => void;
  isClaimed: boolean;
  onClaim: (challenge: Challenge) => void;
  isJustClaimed: boolean;
}> = ({ challenge, onToggleTask, onDelete, isClaimed, onClaim, isJustClaimed }) => {
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

        <div className="mt-6 bg-amber-900/30 border border-amber-500/30 rounded-lg p-4 text-center">
            <p className="text-sm font-bold text-amber-300 tracking-wider">REWARD</p>
            <div className="flex items-center justify-center gap-2 mt-2">
                <TokenIcon className="w-8 h-8 text-amber-400" />
                <p className="text-3xl font-bold text-white">+{challenge.reward.amount}</p>
                <p className="text-xl font-semibold text-gray-300">{challenge.reward.currency}</p>
            </div>
        </div>

        <div className="mt-4 divide-y divide-gray-800">
          {challenge.tasks.map(task => (
            <div key={task.id} className="group py-4">
              <div 
                onClick={() => {
                    if (task.details) {
                        setExpandedTaskId(prevId => (prevId === task.id ? null : task.id));
                    }
                }}
                className={`w-full flex items-center gap-3 text-left ${task.details ? 'cursor-pointer' : ''}`}
              >
                <div className="flex-shrink-0">
                    {task.isCompleted ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500 animate-checkmark-pop" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-600 rounded-full"></div>
                    )}
                </div>
                <div className="flex-grow">
                    <p className={`text-sm transition-colors duration-300 ${task.isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {task.description}
                    </p>
                </div>
                
                {!task.isCompleted && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleTask(challenge.id, task.id);
                        }}
                        className="text-xs font-semibold bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600 flex-shrink-0"
                    >
                        Complete
                    </button>
                )}

                {task.details && (
                   <ChevronDownIcon className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${expandedTaskId === task.id ? 'rotate-180' : ''}`} />
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(challenge.id, task.id); }}
                  className="p-2 -mr-2 text-gray-500 rounded-full hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  aria-label={`Delete task: ${task.description}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
              </div>
              <div
                id={`task-details-${task.id}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedTaskId === task.id ? 'max-h-40' : 'max-h-0'}`}
              >
                  <div className="pt-2 pr-4 pl-9">
                      <p className="text-sm text-gray-300">{task.details}</p>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-black/30">
        <button 
          onClick={() => onClaim(challenge)}
          disabled={!isClaimable}
          className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg transition-all duration-200 ${
            isClaimed 
                ? `bg-green-600 text-white cursor-default ${isJustClaimed ? 'animate-claim-success' : ''}`
                : isClaimable 
                ? 'bg-white text-black hover:scale-105'
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


export const ChallengesPage: React.FC<ChallengesPageProps> = ({ challenges, onToggleTask, onDeleteTask, onRewardClaimed }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [claimedChallengeIds, setClaimedChallengeIds] = useState<number[]>([]);
  const [justClaimedId, setJustClaimedId] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<{ challengeId: number; taskId: number } | null>(null);


  useEffect(() => {
      const storedIds = localStorage.getItem('claimedChallengeIds');
      if (storedIds) {
          setClaimedChallengeIds(JSON.parse(storedIds));
      }
  }, []);

  const handleClaim = (challenge: Challenge) => {
      if (claimedChallengeIds.includes(challenge.id)) return;

      const newClaimedIds = [...claimedChallengeIds, challenge.id];
      setClaimedChallengeIds(newClaimedIds);
      localStorage.setItem('claimedChallengeIds', JSON.stringify(newClaimedIds));
      
      setJustClaimedId(challenge.id);
      setTimeout(() => setJustClaimedId(null), 1000); // Reset after animation
      
      onRewardClaimed(challenge.reward.amount, challenge.title);
  };
  
  const isChallengeComplete = (challenge: Challenge) => challenge.tasks.length > 0 && challenge.tasks.every(t => t.isCompleted);
  
  const completedChallenges = challenges.filter(c => 
    isChallengeComplete(c) && claimedChallengeIds.includes(c.id)
  );
  const activeChallenges = challenges.filter(c => 
    !completedChallenges.some(cc => cc.id === c.id)
  );


  return (
    <div className="p-4 md:p-8 animate-fade-in text-white">
      <div className="flex border-b border-gray-700 mt-4 mb-8">
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-semibold transition-colors duration-200 ${activeTab === 'active' ? 'text-white bg-white/10 rounded-t-lg' : 'text-gray-400'}`}
        >
          Active
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 font-semibold transition-colors duration-200 ${activeTab === 'completed' ? 'text-white bg-white/10 rounded-t-lg' : 'text-gray-400'}`}
        >
          Completed
        </button>
      </div>

      {activeTab === 'active' && (
        <div className="space-y-6">
            {activeChallenges.length > 0 ? (
                activeChallenges.map(challenge => (
                    <ChallengeCard 
                        key={challenge.id} 
                        challenge={challenge} 
                        onToggleTask={onToggleTask}
                        onDelete={(challengeId, taskId) => setTaskToDelete({ challengeId, taskId })}
                        isClaimed={claimedChallengeIds.includes(challenge.id)}
                        onClaim={handleClaim}
                        isJustClaimed={justClaimedId === challenge.id}
                    />
                ))
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">No active challenges available right now.</p>
                </div>
            )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-6">
            {completedChallenges.length > 0 ? (
                completedChallenges.map(challenge => (
                    <ChallengeCard 
                        key={challenge.id} 
                        challenge={challenge} 
                        onToggleTask={onToggleTask}
                        onDelete={(challengeId, taskId) => setTaskToDelete({ challengeId, taskId })}
                        isClaimed={true}
                        onClaim={handleClaim}
                        isJustClaimed={justClaimedId === challenge.id}
                    />
                ))
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">You haven't completed any challenges yet.</p>
                </div>
            )}
        </div>
      )}

        <ConfirmationModal
            isOpen={!!taskToDelete}
            onClose={() => setTaskToDelete(null)}
            onConfirm={() => {
                if (taskToDelete) {
                    onDeleteTask(taskToDelete.challengeId, taskToDelete.taskId);
                    setTaskToDelete(null);
                }
            }}
            title="Delete Task"
            message="Are you sure you want to permanently delete this task? This action cannot be undone."
            confirmText="Delete"
            confirmVariant="danger"
        />
    </div>
  );
};