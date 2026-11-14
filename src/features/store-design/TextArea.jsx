/** Textarea dengan gaya yang sama seperti TextInput di ui.jsx. */
export default function TextArea({ id, label, hint, rows = 4, className = '', ...rest }) {
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-neutral mb-1.5">{label}</label>}
      <textarea
        id={id}
        rows={rows}
        className="w-full px-3 py-2 rounded-md border border-divider text-sm bg-white focus:outline-none focus:border-primary resize-y"
        {...rest}
      />
      {hint && <p className="text-xs text-subdued mt-1.5">{hint}</p>}
    </div>
  );
}
