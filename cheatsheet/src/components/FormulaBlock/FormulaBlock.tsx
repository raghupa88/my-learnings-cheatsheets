import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './FormulaBlock.css';

interface FormulaBlockProps {
  formula: string;
  label?: string;
  displayMode?: boolean;
}

export function FormulaBlock({ formula, label, displayMode = true }: FormulaBlockProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return `<span class="formula-block__error">${formula}</span>`;
    }
  }, [formula, displayMode]);

  return (
    <div className="formula-block">
      {label && <span className="formula-block__label">{label}</span>}
      <div
        className="formula-block__content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
