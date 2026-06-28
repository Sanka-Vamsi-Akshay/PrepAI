import React from 'react';

interface SubmissionNotesEditorProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const SubmissionNotesEditor: React.FC<SubmissionNotesEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const maxLength = 5000;
  const currentLength = value.length;
  const isOverLimit = currentLength > maxLength;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <label className="font-semibold text-slate-800 dark:text-slate-200">Study Notepad</label>
        <span className={`text-[10px] font-mono ${isOverLimit ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
          {currentLength} / {maxLength} chars
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Jot down logic, edge cases, time/space complexities, or paste solutions here..."
        className={`w-full h-80 bg-slate-50 dark:bg-slate-950 border rounded-xl p-4 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors duration-150 resize-y leading-relaxed ${
          isOverLimit
            ? 'border-red-500 focus:border-red-500'
            : 'border-slate-200 dark:border-slate-850'
        }`}
      />
      {isOverLimit && (
        <p className="text-[10px] text-red-500 font-semibold">
          Error: Your notes exceed the maximum limit of 5000 characters.
        </p>
      )}
    </div>
  );
};
export default SubmissionNotesEditor;
