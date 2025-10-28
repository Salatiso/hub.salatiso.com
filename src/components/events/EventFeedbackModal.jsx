import { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';

const EventFeedbackModal = ({ event, onClose, onSubmitFeedback }) => {
  const [feedback] = useState(event.feedback || []);
  const [newFeedback, setNewFeedback] = useState({
    rating: 5,
    comment: '',
    suggestions: ''
  });

  const submitFeedback = () => {
    const feedbackEntry = {
      id: Date.now(),
      userId: 'current_user', // In real app, get from auth
      userName: 'Current User', // In real app, get from profile
      rating: newFeedback.rating,
      comment: newFeedback.comment,
      suggestions: newFeedback.suggestions,
      submittedAt: Date.now()
    };

    if (onSubmitFeedback) {
      onSubmitFeedback(event.id, feedbackEntry);
    }

    setNewFeedback({ rating: 5, comment: '', suggestions: '' });
  };

  const averageRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Event Feedback</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{feedback.length}</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">Total Feedback</div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{averageRating}</div>
              <div className="text-sm text-yellow-800 dark:text-yellow-200">Average Rating</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {feedback.filter(f => f.rating >= 4).length}
              </div>
              <div className="text-sm text-green-800 dark:text-green-200">Positive Reviews</div>
            </div>
          </div>

          {/* Submit Feedback */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-semibold mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Share Your Feedback
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewFeedback(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl ${star <= newFeedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Comments</label>
                <textarea
                  value={newFeedback.comment}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="How was your experience?"
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Suggestions for Improvement</label>
                <textarea
                  value={newFeedback.suggestions}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, suggestions: e.target.value }))}
                  placeholder="What could we do better next time?"
                  className="w-full p-3 border rounded-lg"
                  rows={2}
                />
              </div>

              <button
                onClick={submitFeedback}
                disabled={!newFeedback.comment.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-gray-400"
              >
                Submit Feedback
              </button>
            </div>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            <h4 className="font-semibold">All Feedback ({feedback.length})</h4>
            {feedback.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No feedback yet. Be the first to share your thoughts!</p>
            ) : (
              feedback.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{item.userName}</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {new Date(item.submittedAt).toLocaleDateString()}
                  </div>
                  {item.comment && (
                    <div className="mb-2">
                      <strong>Comments:</strong> {item.comment}
                    </div>
                  )}
                  {item.suggestions && (
                    <div>
                      <strong>Suggestions:</strong> {item.suggestions}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFeedbackModal;