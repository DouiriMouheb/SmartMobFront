
const sizeClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg', 
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export default function Modal({
  open,
  title,
  children,
  footer,
  size = '2xl',
  className = '',
  showHeader = true,
  onBackdropClick,
}) {
  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (onBackdropClick) onBackdropClick(e);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 p-3 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ${className || sizeClasses[size]} max-h-[90vh] min-h-fit flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {showHeader && title && (
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
            <h3 className="text-center text-lg font-bold text-slate-900">{title}</h3>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
