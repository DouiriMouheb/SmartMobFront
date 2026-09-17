import { useCallback, useEffect, useMemo, useState } from 'react';
import acquisizioniService from '../services/acquisizioniService';
import { showError } from '../services/toastService';

/**
 * Revisione utente (CHECKED_BY_USER + USER_NOTES) di una lista di acquisizioni.
 *
 * Tre mappe indicizzate per id:
 *  - reviewBase   valori dell'ultimo salvataggio andato a buon fine
 *  - reviewState  modifiche pendenti/ottimistiche, cancellate a salvataggio ok
 *  - savingReview flag di richiesta in volo
 *
 * Il PATCH sovrascrive entrambi i campi, quindi si inviano sempre tutti e due.
 */
export const useUserReview = (records) => {
  const [reviewState, setReviewState] = useState({});
  const [reviewBase, setReviewBase] = useState({});
  const [savingReview, setSavingReview] = useState({});

  // Il set di record cambia (nuovo filtro, nuova ricerca): si riparte dai
  // valori del server e si buttano via eventuali edit pendenti.
  useEffect(() => {
    const next = {};

    (records || []).forEach((item) => {
      next[item.id] = {
        checkedByUser: item.checkedByUser ?? null,
        userNotes: item.userNotes ?? '',
      };
    });

    setReviewBase(next);
    setReviewState({});
    setSavingReview({});
  }, [records]);

  const getReviewField = useCallback((itemId, field, fallback) => {
    if (reviewState[itemId] && Object.prototype.hasOwnProperty.call(reviewState[itemId], field)) {
      return reviewState[itemId][field];
    }

    if (reviewBase[itemId] && Object.prototype.hasOwnProperty.call(reviewBase[itemId], field)) {
      return reviewBase[itemId][field];
    }

    return fallback;
  }, [reviewBase, reviewState]);

  const getCheckedByUser = useCallback((item) => (
    getReviewField(item.id, 'checkedByUser', item.checkedByUser ?? null)
  ), [getReviewField]);

  const getUserNotes = useCallback((item) => (
    getReviewField(item.id, 'userNotes', item.userNotes ?? '')
  ), [getReviewField]);

  const setReviewField = useCallback((itemId, field, value) => {
    setReviewState((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  }, []);

  const isSaving = useCallback((itemId) => Boolean(savingReview[itemId]), [savingReview]);

  const saveReview = useCallback(async (item, updates = {}) => {
    const hasCheckedUpdate = Object.prototype.hasOwnProperty.call(updates, 'checkedByUser');
    const hasNotesUpdate = Object.prototype.hasOwnProperty.call(updates, 'userNotes');

    const nextCheckedByUser = hasCheckedUpdate
      ? updates.checkedByUser
      : getReviewField(item.id, 'checkedByUser', item.checkedByUser ?? null);

    const nextUserNotes = hasNotesUpdate
      ? updates.userNotes
      : getReviewField(item.id, 'userNotes', item.userNotes ?? '');

    const base = reviewBase[item.id] || {
      checkedByUser: item.checkedByUser ?? null,
      userNotes: item.userNotes ?? '',
    };

    if (base.checkedByUser === nextCheckedByUser && base.userNotes === nextUserNotes) {
      return;
    }

    setSavingReview((prev) => ({ ...prev, [item.id]: true }));
    setReviewState((prev) => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        checkedByUser: nextCheckedByUser,
        userNotes: nextUserNotes,
      },
    }));

    const result = await acquisizioniService.updateUserReview(item.id, {
      checkedByUser: nextCheckedByUser,
      userNotes: nextUserNotes,
    });

    setSavingReview((prev) => ({ ...prev, [item.id]: false }));

    if (!result.success) {
      showError(result.message || 'Errore aggiornamento revisione utente');
      setReviewState((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      return;
    }

    setReviewBase((prev) => ({
      ...prev,
      [item.id]: {
        checkedByUser: nextCheckedByUser,
        userNotes: nextUserNotes,
      },
    }));
    setReviewState((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
  }, [getReviewField, reviewBase]);

  /**
   * Da chiamare alla chiusura del modal: la nota si salva su blur, ma chiudere
   * con backdrop/Esc puo' saltarlo e la modifica andrebbe persa.
   */
  const flush = useCallback((item) => {
    if (!item || savingReview[item.id]) {
      return;
    }

    saveReview(item, {
      checkedByUser: getCheckedByUser(item),
      userNotes: getUserNotes(item),
    });
  }, [getCheckedByUser, getUserNotes, saveReview, savingReview]);

  const getReviewLabel = useCallback((value) => {
    if (value === true) {
      return 'approvato';
    }

    if (value === false) {
      return 'non approvato';
    }

    return 'non verificato';
  }, []);

  return useMemo(() => ({
    getCheckedByUser,
    getUserNotes,
    setReviewField,
    saveReview,
    isSaving,
    flush,
    getReviewLabel,
  }), [flush, getCheckedByUser, getReviewLabel, getUserNotes, isSaving, saveReview, setReviewField]);
};
