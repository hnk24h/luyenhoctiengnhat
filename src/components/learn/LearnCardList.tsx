import React from 'react';

interface LearnCardListProps {
  children: React.ReactNode;
}

export const LearnCardList: React.FC<LearnCardListProps> = ({ children }) => (
  <div className="space-y-3 mt-6">
    {children}
  </div>
);
