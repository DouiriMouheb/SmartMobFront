/**
 * Utility di data condivise tra le pagine.
 *
 * Attenzione ai fusi: le stringhe degli <input type="date"> sono YYYY-MM-DD e
 * `new Date('2026-08-26')` le interpreta come UTC, spostando il confine di un
 * intero giorno nei fusi negativi. Per questo i bound si costruiscono sempre
 * con il costruttore a componenti, che e' locale.
 */

export const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseInputDate = (value, hours, minutes, seconds, milliseconds) => {
  if (!value) {
    return null;
  }

  const [year, month, day] = String(value).split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (value) => parseInputDate(value, 0, 0, 0, 0);
const endOfDay = (value) => parseInputDate(value, 23, 59, 59, 999);

/**
 * Il record espone dT_INS (data acquisizione, immutabile) e dT_AGG (bumpata a
 * ogni salvataggio revisione). Si filtra su dT_INS, con dT_AGG come ripiego
 * quando dT_INS e' null su record vecchi.
 */
export const getRecordDate = (item) => {
  const raw = item?.dT_INS ?? item?.dT_AGG ?? null;

  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Intervallo inclusivo su entrambi gli estremi. Senza bound passa tutto; con
 * almeno un bound un record senza data utilizzabile viene escluso, altrimenti
 * comparirebbe in qualunque intervallo.
 */
export const isWithinDateRange = (item, startDate, endDate) => {
  if (!startDate && !endDate) {
    return true;
  }

  const recordDate = getRecordDate(item);

  if (!recordDate) {
    return false;
  }

  const from = startOfDay(startDate);
  if (from && recordDate < from) {
    return false;
  }

  const to = endOfDay(endDate);
  if (to && recordDate > to) {
    return false;
  }

  return true;
};
