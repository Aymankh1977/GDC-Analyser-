import React from 'react';

interface EnhancedAnalysisCardProps {
  title: string;
  content: string;
  score?: number;
  type: 'strengths' | 'improvements' | 'risks';
}

const EnhancedAnalysisCard: React.FC<EnhancedAnalysisCardProps> = ({ 
  title, content, score, type 
}) => {
  const getCardStyles = () => {
    switch (type) {
      case 'strengths':
        return {
          gradient: 'from-green-50 to-emerald-50',
          border: 'border-green-200',
          header: 'bg-gradient-to-r from-green-500 to-emerald-500',
          icon: '🎯',
          scoreColor: 'text-green-600'
        };
      case 'improvements':
        return {
          gradient: 'from-amber-50 to-orange-50',
          border: 'border-amber-200',
          header: 'bg-gradient-to-r from-amber-500 to-orange-500',
          icon: '📈',
          scoreColor: 'text-amber-600'
        };
      case 'risks':
        return {
          gradient: 'from-red-50 to-rose-50',
          border: 'border-red-200',
          header: 'bg-gradient-to-r from-red-500 to-rose-500',
          icon: '⚠️',
          scoreColor: 'text-red-600'
        };
      default:
        return {
          gradient: 'from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          header: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          icon: '📊',
          scoreColor: 'text-blue-600'
        };
    }
  };

  const styles = getCardStyles();

  return (
    <div className={`bg-gradient-to-br ${styles.gradient} border ${styles.border} rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 card-hover overflow-hidden animate-fade-in`}>
      {/* Header */}
      <div className={`${styles.header} px-6 py-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{styles.icon}</span>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          {score !== undefined && (
            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
              <span className={`text-sm font-bold ${styles.scoreColor}`}>
                {score}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto">
        <div 
          className="prose-custom"
          dangerouslySetInnerHTML={{ 
            __html: content.replace(/\n/g, '<br>')
              .replace(/### (.*?)(?=\n|$)/g, '<h3>$1</h3>')
              .replace(/## (.*?)(?=\n|$)/g, '<h2>$1</h2>')
              .replace(/\• (.*?)(?=\n|$)/g, '<li>$1</li>')
              .replace(/🟢/g, '<span class="status-high px-2 py-1 rounded text-sm">LOW RISK</span>')
              .replace(/🟡/g, '<span class="status-medium px-2 py-1 rounded text-sm">MEDIUM RISK</span>')
              .replace(/🔴/g, '<span class="status-low px-2 py-1 rounded text-sm">HIGH RISK</span>')
          }}
        />
      </div>
    </div>
  );
};

export default EnhancedAnalysisCard;
