import React from 'react';
import { Venue, VenueReview } from '../types';
import { users } from '../data/mockData';
import { StarIcon } from './icons/StarIcon';

interface VenueReviewsPageProps {
  venue: Venue;
  reviews: VenueReview[];
}

export const VenueReviewsPage: React.FC<VenueReviewsPageProps> = ({ venue, reviews }) => {
  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
  const ratingDistribution: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
      ratingDistribution[r.rating]++;
  });

  return (
    <div className="p-4 md:p-6 animate-fade-in text-white space-y-8">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="flex items-center gap-4">
                <p className="text-6xl font-bold">{averageRating.toFixed(1)}</p>
                <div>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-6 h-6 ${i < Math.round(averageRating) ? 'text-amber-400' : 'text-gray-600'}`} />)}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Based on {reviews.length} reviews</p>
                </div>
            </div>
            <div className="mt-6 space-y-2">
                {Object.entries(ratingDistribution).reverse().map(([stars, count]) => {
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                        <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">{stars}</span>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-sm text-gray-400 w-8 text-right">{Math.round(percentage)}%</span>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="space-y-6">
            {reviews.map((review) => {
                const user = users.find(u => u.id === review.userId);
                return (
                    <div key={review.id} className="bg-gray-900 p-5 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-3">
                            {user && <img src={user.profilePhoto} alt={user.name} className="w-12 h-12 rounded-full object-cover" />}
                            <div>
                                <p className="font-bold text-white">{user ? user.name : 'Anonymous'}</p>
                                <p className="text-xs text-gray-400">{review.timestamp}</p>
                            </div>
                        </div>
                        <div className="flex my-3">
                            {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-5 h-5 ${i < review.rating ? 'text-amber-400' : 'text-gray-600'}`} />)}
                        </div>
                        <p className="text-gray-300 leading-relaxed">{review.text}</p>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
