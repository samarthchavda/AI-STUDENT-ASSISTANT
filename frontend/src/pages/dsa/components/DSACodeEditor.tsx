import { useEffect, useRef } from 'react';

interface Props {
  code: string;
  language: 'python' | 'javascript' | 'cpp';
  onChange: (code: string) => void;
}

export default function DSACodeEditor({ code, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [code]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      onChange(newCode);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
        <p className="text-xs font-medium text-gray-400">Code Editor</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-full bg-transparent text-gray-100 font-mono text-sm leading-relaxed resize-none focus:outline-none"
          style={{
            tabSize: 4,
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace"
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
