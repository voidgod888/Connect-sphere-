import React, { useState } from 'react';

interface AgeVerificationProps {
  onVerify: (age: number) => void;
  onCancel: () => void;
}

export const AgeVerification: React.FC<AgeVerificationProps> = ({ onVerify, onCancel }) => {
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    setError('');

    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);

    if (!year || !month || !day) {
      setError('Please enter your complete date of birth');
      return;
    }

    if (year < 1900 || year > new Date().getFullYear()) {
      setError('Please enter a valid year');
      return;
    }

    if (month < 1 || month > 12) {
      setError('Please enter a valid month (1-12)');
      return;
    }

    if (day < 1 || day > 31) {
      setError('Please enter a valid day (1-31)');
      return;
    }

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 13) {
      setError('You must be at least 13 years old to use ConnectSphere');
      return;
    }

    if (age > 120) {
      setError('Please enter a valid date of birth');
      return;
    }

    onVerify(age);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-scaleIn">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Age Verification</h2>
          <p className="text-blue-100 text-sm">Please confirm your age to continue</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-gray-300 text-sm">
              ConnectSphere is available for users aged <strong className="text-white">13 and above</strong>.
              We ask for your date of birth to ensure a safe experience for all users.
            </p>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-3">
              What is your date of birth?
            </label>

            <div className="grid grid-cols-3 gap-3">
              {/* Month */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Month</label>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border-2 border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">--</option>
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month.slice(0, 3)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Day</label>
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border-2 border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">--</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Year</label>
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border-2 border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">----</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-400">
              <strong className="text-gray-300">Privacy:</strong> Your date of birth is used only for
              age verification and safety features. It will not be shared publicly.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Verify Age
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
