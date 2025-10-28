import { useState, useContext } from 'react';
import { Star, ThumbsUp, Shield, Users } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';

const ReciprocalRatingSystem = ({ syncId, partnerId, onRatingComplete }) => {
  const { guestData, setGuestData } = useContext(GuestContext);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [categories, setCategories] = useState({
    communication: 0,
    reliability: 0,
    compatibility: 0,
    respect: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCategoryRating = (category, value) => {
    setCategories(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmitRating = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);

    // Calculate overall compatibility score
    const categoryAverage = Object.values(categories).reduce((a, b) => a + b, 0) / Object.values(categories).length;
    const overallScore = Math.round((rating + categoryAverage) / 2);

    const ratingData = {
      id: Math.random().toString(36).substring(2, 15),
      syncId,
      partnerId,
      overallRating: rating,
      categoryRatings: categories,
      compatibilityScore: overallScore,
      feedback,
      timestamp: Date.now(),
      context: 'sync-feedback'
    };

    // Update guest data with new feedback
    const updatedGuestData = {
      ...guestData,
      feedback: [...(guestData.feedback || []), ratingData]
    };

    setGuestData(updatedGuestData);
    setSubmitted(true);
    setIsSubmitting(false);

    onRatingComplete?.(ratingData);
  };

  const getRatingColor = (value) => {
    if (value >= 4) return 'text-green-600';
    if (value >= 3) return 'text-blue-600';
    if (value >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingText = (value) => {
    if (value >= 4.5) return 'Excellent';
    if (value >= 4) return 'Very Good';
    if (value >= 3) return 'Good';
    if (value >= 2) return 'Fair';
    return 'Poor';
  };

  if (submitted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <ThumbsUp className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Thank You for Your Feedback!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your rating helps build trust in the LifeSync community
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              Your feedback has been recorded and will contribute to both your trust score and your partner's.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Rate Your Sync Experience
        </h3>
      </div>

      <div className="space-y-6">
        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Overall Experience
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          {(rating > 0 || hoverRating > 0) && (
            <p className={`text-sm mt-2 ${getRatingColor(rating || hoverRating)}`}>
              {getRatingText(rating || hoverRating)}
            </p>
          )}
        </div>

        {/* Category Ratings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Rate Specific Aspects
          </label>
          <div className="space-y-4">
            {Object.entries({
              communication: 'Communication',
              reliability: 'Reliability',
              compatibility: 'Compatibility',
              respect: 'Respect & Trust'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-32">
                  {label}
                </span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleCategoryRating(key, value)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors ${
                        categories[key] === value
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Feedback (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience or suggestions for improvement..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            rows={3}
          />
        </div>

        {/* Trust Impact Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Trust Score Impact</p>
              <p>Your rating will contribute to both your Universal Trust Score and your partner's score in the LifeSync ecosystem.</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmitRating}
            disabled={rating === 0 || isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              rating === 0 || isSubmitting
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReciprocalRatingSystem;
