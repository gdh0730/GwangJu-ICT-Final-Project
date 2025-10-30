import React from 'react';

const renderInlineContent = (text: string): React.ReactNode[] => {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((segment, index) => {
      const boldMatch = segment.match(/^\*\*(.*)\*\*$/);
      if (boldMatch) {
        return (
          <strong key={`bold-${index}`}>{boldMatch[1]}</strong>
        );
      }
      return <React.Fragment key={`text-${index}`}>{segment}</React.Fragment>;
    });
};

interface AiAnalysisPanelProps {
  analysis: string;
  isLoading: boolean;
  onGenerate: () => void;
  selectedRegion: string;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={`${keyPrefix}-list`} className="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
        {listBuffer.map((item, index) => (
          <li key={`${keyPrefix}-item-${index}`}>{renderInlineContent(item)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(`line-${index}`);
      return;
    }

    if (trimmed.startsWith('- ')) {
      listBuffer.push(trimmed.substring(2));
      return;
    }

    flushList(`line-${index}`);

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-md font-bold text-gray-800 dark:text-white mt-4 mb-2">
          {renderInlineContent(trimmed.substring(4))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${index}`} className="text-lg font-bold text-gray-800 dark:text-white mt-4 mb-2">
          {renderInlineContent(trimmed.substring(3))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${index}`} className="text-xl font-bold text-gray-800 dark:text-white mt-4 mb-2">
          {renderInlineContent(trimmed.substring(2))}
        </h1>
      );
      return;
    }

    elements.push(
      <p key={`p-${index}`} className="text-sm leading-6">
        {renderInlineContent(trimmed)}
      </p>
    );
  });

  flushList('final');

  if (elements.length === 0) {
    return null;
  }

  return (
    <article className="prose prose-sm dark:prose-invert max-w-none space-y-2">
      {elements}
    </article>
  );
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
