import React from 'react';
import { StarIcon } from './icons/StarIcon';
import { ThumbUpIcon } from './icons/ThumbUpIcon';
import { ThumbDownIcon } from './icons/ThumbDownIcon';

const mockReviews = [
    {
        name: 'Sophia Bennett',
        avatar: 'https://picsum.photos/seed/sophia/100/100',
        time: '2 months ago',
        rating: 5,
        text: 'Absolutely stunning experience! The ambiance was perfect, the service impeccable, and the food was divine. A must-visit for anyone looking for a luxurious dining experience.',
        likes: 23,
        dislikes: 2,
    },
    {
        name: 'Ethan Carter',
        avatar: 'https://picsum.photos/seed/ethan/100/100',
        time: '3 months ago',
        rating: 4,
        text: 'Great atmosphere and delicious cocktails.',
        likes: 15,
        dislikes: 1,
    }
];

const ratingDistribution = { 5: 40, 4: 30, 3: 15, 2: 10, 1: 5 };

export const ReviewsPage: React.FC = () => {
    return (
        <div className="p-4 md:p-6 animate-fade-in text-white space-y-8">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <div className="flex items-center gap-4">
                    <p className="text-6xl font-bold">4.5</p>
                    <div>
                        <div className="flex">
                            {[...Array(4)].map((_, i) => <StarIcon key={i} className="w-6 h-6 text-amber-400" />)}
                            <StarIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Based on 123 reviews</p>
                    </div>
                </div>
                <div className="mt-6 space-y-2">
                    {Object.entries(ratingDistribution).reverse().map(([stars, percentage]) => (
                        <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">{stars}</span>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-sm text-gray-400 w-8 text-right">{percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                {mockReviews.map((review, index) => (
                    <div key={index} className="bg-gray-900 p-5 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-3">
                            <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <p className="font-bold text-white">{review.name}</p>
                                <p className="text-xs text-gray-400">{review.time}</p>
                            </div>
                        </div>
                        <div className="flex my-3">
                            {[...Array(review.rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-amber-400" />)}
                            {[...Array(5 - review.rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-gray-600" />)}
                        </div>
                        <p className="text-gray-300 leading-relaxed">{review.text}</p>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-800">
                            <button className="flex items-center gap-2 text-gray-400 hover:text-white">
                                <ThumbUpIcon className="w-5 h-5" />
                                <span className="text-sm font-semibold">{review.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-400 hover:text-white">
                                <ThumbDownIcon className="w-5 h-5" />
                                <span className="text-sm font-semibold">{review.dislikes}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
