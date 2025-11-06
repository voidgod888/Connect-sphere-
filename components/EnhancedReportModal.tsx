import React, { useState } from 'react';
import { ReportCategory } from '../types';

interface EnhancedReportModalProps {
  onReport: (category: ReportCategory, description: string) => void;
  onClose: () => void;
}

const REPORT_CATEGORIES = [
  { 
    value: ReportCategory.InappropriateContent, 
    label: 'Inappropriate Content', 
    icon: '🚫',
    description: 'Nudity, sexual content, or explicit material'
  },
  { 
    value: ReportCategory.Harassment, 
    label: 'Harassment', 
    icon: '😠',
    description: 'Bullying, threats, or abusive behavior'
  },
  { 
    value: ReportCategory.Spam, 
    label: 'Spam', 
    icon: '📧',
    description: 'Unwanted advertising or repetitive messages'
  },
  { 
    value: ReportCategory.Underage, 
    label: 'Underage User', 
    icon: '👶',
    description: 'User appears to be under 18 years old'
  },
  { 
    value: ReportCategory.Violence, 
    label: 'Violence', 
    icon: '⚠️',
    description: 'Threats of violence or dangerous behavior'
  },
  { 
    value: ReportCategory.Other, 
    label: 'Other', 
    icon: '❓',
    description: 'Other violations of terms of service'
  },
];

export const EnhancedReportModal: React.FC<EnhancedReportModalProps> = ({
  onReport,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategory) return;
    
    setIsSubmitting(true);
    await onReport(selectedCategory, description);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="sticky top-0 bg-red-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white">Report User</h2>
            <p className="text-red-100 text-sm">Help us keep the community safe</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-300 mb-3">
              Select a reason for reporting
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {REPORT_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    selectedCategory === category.value
                      ? 'bg-red-600 text-white ring-2 ring-red-400'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{category.label}</h3>
                      <p className={`text-xs ${
                        selectedCategory === category.value ? 'text-red-100' : 'text-gray-400'
                      }`}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-300 mb-3">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context about the incident..."
              rows={4}
              maxLength={500}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
            />
            <p className="text-xs text-gray-400 mt-2">
              {description.length}/500 characters
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-yellow-500 mb-1">Important</p>
                <p>False reports may result in penalties to your account. This user will be blocked automatically.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedCategory || isSubmitting}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
