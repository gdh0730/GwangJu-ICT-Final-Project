import React from 'react';

interface AiAnalysisPanelProps {
  analysis: string;
  isLoading: boolean;
  onGenerate: () => void;
  selectedRegion: string;
}

// A simple component to render markdown content safely
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const renderContent = () => {
    // Replace markdown-like syntax with HTML tags
    const htmlContent = content
      .replace(/^### (.*$)/gim, '<h3 class="text-md font-bold text-gray-800 dark:text-white mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-gray-800 dark:text-white mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-gray-800 dark:text-white mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\n- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>') // List items
      .split('\n').map(line => line.trim() === '' ? '<br/>' : line).join('').replace(/(<br\/>){2,}/g, '<br/>') // handle paragraphs
      .replace(/<li/g, '<ul class="pl-2"><li')
      .replace(/li><ul/g, 'li></ul><ul') + '</ul>';

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  return <article className="prose prose-sm dark:prose-invert max-w-none">{renderContent()}</article>;
};


const AiAnalysisPanel: React.FC<AiAnalysisPanelProps> = ({ analysis, isLoading, onGenerate, selectedRegion }) => {
  return (
    <div className="bg-white dark:bg-ocean-blue-900 rounded-2xl shadow-lg p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          AI 종합 분석 리포트
        </h3>
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="px-4 py-2 bg-ocean-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-ocean-blue-700 disabled:bg-ocean-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ocean-blue-500 focus:ring-offset-2 dark:focus:ring-offset-ocean-blue-900 transition-colors"
        >
          {isLoading ? '분석 중...' : '리포트 생성'}
        </button>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2 text-gray-700 dark:text-gray-300">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-ocean-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {selectedRegion} 데이터를 분석 중입니다...
              </p>
            </div>
          </div>
        ) : (
          analysis ? (
             <MarkdownRenderer content={analysis} />
          ) : (
            <div className="flex items-center justify-center h-full text-center">
                <p className="text-gray-500 dark:text-gray-400">
                    '리포트 생성' 버튼을 눌러
                    <br />
                    선택된 해역의 AI 분석을 시작하세요.
                </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AiAnalysisPanel;
