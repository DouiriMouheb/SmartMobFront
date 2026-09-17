import React from 'react';

const reviewOptions = [
  { value: true, label: 'Si', activeClass: 'bg-green-600 text-white' },
  { value: null, label: '-', activeClass: 'bg-gray-400 text-white' },
  { value: false, label: 'No', activeClass: 'bg-red-600 text-white' },
];

/**
 * Blocco "Revisione Utente": toggle Si / - / No piu' nota libera.
 * `review` e' il valore restituito da useUserReview.
 */
const UserReviewPanel = ({ item, review }) => {
  if (!item) {
    return null;
  }

  const checkedByUser = review.getCheckedByUser(item);
  const saving = review.isSaving(item.id);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Revisione Utente
        </span>

        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden bg-white">
          {reviewOptions.map((option, index) => {
            const isActive = option.value === checkedByUser
              || (option.value === null && (checkedByUser === null || checkedByUser === undefined));
            const activeClass = option.activeClass;
            const inactiveClass = 'text-gray-600 hover:bg-gray-50';
            const separator = index < reviewOptions.length - 1 ? 'border-r border-gray-300' : '';

            return (
              <button
                key={option.label}
                type="button"
                className={`px-2 py-1 text-xs font-medium transition ${separator} ${isActive ? activeClass : inactiveClass} ${saving ? 'cursor-not-allowed opacity-60' : ''}`}
                onClick={() => review.saveReview(item, { checkedByUser: option.value })}
                aria-pressed={isActive}
                aria-label={`Approvazione utente: ${option.label === '-' ? 'Non verificato' : option.label}`}
                title={option.label === '-' ? 'Non verificato' : option.label}
                disabled={saving}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <textarea
        value={review.getUserNotes(item)}
        onChange={(e) => review.setReviewField(item.id, 'userNotes', e.target.value)}
        onBlur={(e) => review.saveReview(item, { userNotes: e.target.value })}
        className="w-full min-h-[96px] resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:ring-1 focus:ring-red-300"
        placeholder="Aggiungi una nota per questa acquisizione..."
        aria-label="Note utente"
        disabled={saving}
      />
    </div>
  );
};

export default UserReviewPanel;
