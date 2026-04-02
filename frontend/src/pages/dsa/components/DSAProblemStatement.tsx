interface ProblemData {
  id: number;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
}

interface Props {
  problem: ProblemData;
}

export default function DSAProblemStatement({ problem }: Props) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{problem.title}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
            {problem.topic}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Problem Description</h2>
        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
          {problem.description}
        </div>
      </div>

      {/* Examples */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Examples</h2>
        <div className="space-y-4">
          {problem.examples.map((example, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">Example {index + 1}:</p>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Input: </span>
                  <code className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{example.input}</code>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Output: </span>
                  <code className="text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded">{example.output}</code>
                </div>
                {example.explanation && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Explanation: </span>
                    <span className="text-sm text-gray-600">{example.explanation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Constraints</h2>
        <ul className="space-y-2">
          {problem.constraints.map((constraint, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <code className="flex-1 bg-gray-50 px-2 py-1 rounded text-xs">{constraint}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
