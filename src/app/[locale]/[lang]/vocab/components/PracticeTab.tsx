import React from 'react';

interface PracticeTabProps {
  // Add props as needed for practice logic
}

export const PracticeTab: React.FC<PracticeTabProps> = () => {
  // Placeholder UI for practice
  return (
    <div className="py-10 text-center">
      <h2 className="font-extrabold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Practice</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Tính năng luyện tập sẽ sớm có mặt.</p>
      {/* Add quiz, input, multiple choice, etc. here */}
    </div>
  );
};