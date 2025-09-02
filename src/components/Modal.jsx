export default function Modal({ 
  open, 
  title, 
  children, 
  onClose, 
  size = "md",
  showHeader = true 
}) {
  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    "2xl": "max-w-7xl",
    form: "max-w-4xl",
  };


  // Disable closing modal by clicking outside
  function handleBackdropClick(e) {
    // Do nothing, prevent closing on backdrop click
  }

  return (
    <div
      className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center z-[100] p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl border border-slate-200 w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {showHeader && title && (
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-2xl font-bold text-center text-black">{title}</h3>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
