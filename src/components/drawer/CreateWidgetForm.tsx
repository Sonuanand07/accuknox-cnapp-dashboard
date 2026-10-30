import { useState, type FormEvent } from 'react';

const NAME_MAX = 40;
const TEXT_MAX = 160;

interface CreateWidgetFormProps {
  categoryTitle: string;
  tabLabel: string;
  /** Lower-cased names already used in this category (duplicates are rejected). */
  existingNames: string[];
  onAdd: (name: string, text: string) => void;
}

export function CreateWidgetForm({ categoryTitle, tabLabel, existingNames, onAdd }: CreateWidgetFormProps) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<{ name?: string; text?: string }>({});
  const [status, setStatus] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedText = text.trim();
    const next: { name?: string; text?: string } = {};
    if (!trimmedName) next.name = 'Enter a widget name.';
    else if (trimmedName.length > NAME_MAX) next.name = `Keep the name under ${NAME_MAX} characters.`;
    else if (existingNames.includes(trimmedName.toLowerCase())) next.name = `“${trimmedName}” already exists in ${categoryTitle}.`;
    if (!trimmedText) next.text = 'Enter the widget text.';
    else if (trimmedText.length > TEXT_MAX) next.text = `Keep the text under ${TEXT_MAX} characters.`;
    setErrors(next);
    if (next.name || next.text) {
      setStatus('');
      return;
    }
    onAdd(trimmedName, trimmedText);
    setName('');
    setText('');
    setStatus(`Added “${trimmedName}”. Press Confirm to save it to the dashboard.`);
  };

  return (
    <form className="create-form" onSubmit={handleSubmit} noValidate aria-labelledby="create-widget-heading">
      <h3 id="create-widget-heading" className="create-form__title">Create a new widget in {tabLabel}</h3>
      <div className="field">
        <label htmlFor="widget-name">Widget name</label>
        <input
          id="widget-name" type="text" value={name} maxLength={NAME_MAX + 20} autoComplete="off"
          placeholder="e.g. Patch compliance" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'widget-name-error' : undefined}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p id="widget-name-error" className="field__error">{errors.name}</p>}
      </div>
      <div className="field">
        <label htmlFor="widget-text">Widget text</label>
        <textarea
          id="widget-text" rows={2} value={text} placeholder="Short description shown inside the widget"
          aria-invalid={!!errors.text} aria-describedby={errors.text ? 'widget-text-error' : undefined}
          onChange={(e) => setText(e.target.value)}
        />
        {errors.text && <p id="widget-text-error" className="field__error">{errors.text}</p>}
      </div>
      <div className="create-form__footer">
        <button type="submit" className="btn btn--outline">Add to {tabLabel}</button>
        <p className="create-form__status" role="status">{status}</p>
      </div>
    </form>
  );
}
