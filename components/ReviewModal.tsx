
import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
  language: Language;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, language }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, feedback);
      // Reset state
      setRating(0);
      setFeedback('');
    }
  };

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl relative z-10 animate-slide-up p-6 overflow-hidden">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full transition-colors"
        >
            <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-6">
            {t.reviewTitle}
        </h3>

        <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90 focus:outline-none"
                >
                    <Star 
                        size={36} 
                        className={`transition-colors ${
                            star <= rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300 dark:text-gray-600'
                        }`} 
                    />
                </button>
            ))}
        </div>

        <textarea
            className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-6 text-gray-900 dark:text-white placeholder-gray-400 resize-none outline-none focus:ring-2 focus:ring-green-500 transition-all border border-transparent focus:border-green-500"
            rows={3}
            placeholder={t.reviewPlaceholder}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
        />

        <div className="flex space-x-3">
            <button 
                onClick={onClose}
                className="flex-1 py-3 text-gray-500 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
                {t.skip}
            </button>
            <button 
                onClick={handleSubmit}
                disabled={rating === 0}
                className={`flex-[2] py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                    rating === 0 
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-500 shadow-none' 
                    : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
                }`}
            >
                {t.submitReview}
            </button>
        </div>
      </div>
    </div>
  );
};
