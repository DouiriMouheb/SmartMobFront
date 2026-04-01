const isObject = (value) => value !== null && typeof value === 'object';

const hasArrayPayload = (payload) => (
  Array.isArray(payload)
  || Array.isArray(payload?.data)
  || Array.isArray(payload?.data?.data)
);

export const extractAcquisizioniArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  return [];
};

export const normalizeAcquisizioneRecord = (item) => {
  if (!isObject(item)) {
    return null;
  }

  return {
    ...item,
    coD_LINEA: item.coD_LINEA ?? item.codLineaProd ?? null,
    coD_POSTAZIONE: item.coD_POSTAZIONE ?? item.codPostazione ?? null,
    fotO_SUPERIORE: item.fotO_SUPERIORE ?? item.fotoSuperiore ?? null,
    fotO_FRONTALE: item.fotO_FRONTALE ?? item.fotoFrontale ?? null,
    fotO_BOX: item.fotO_BOX ?? item.fotoBox ?? null,
    abilitA_CQ: item.abilitA_CQ ?? item.abilitaCq ?? null,
    esitO_CQ_ARTICOLO: item.esitO_CQ_ARTICOLO ?? item.esitoCqArticolo ?? null,
    scostamentO_CQ_ARTICOLO: item.scostamentO_CQ_ARTICOLO ?? item.scostamentoCqArticolo ?? 0,
    codicE_ARTICOLO: item.codicE_ARTICOLO ?? item.codiceArticolo ?? '',
    codicE_ORDINE: item.codicE_ORDINE ?? item.codiceOrdine ?? '',
    rightSideAngleDifferent: item.rightSideAngleDifferent
      ?? item.RightSideAngleDifferent
      ?? item.righT_SIDE_ANGLE_DIFFERENT
      ?? item.RIGHT_SIDE_ANGLE_DIFFERENT
      ?? item.right_side_angle_different
      ?? null,
    rightSideMisalignmentDifferent: item.rightSideMisalignmentDifferent
      ?? item.RightSideMisalignmentDifferent
      ?? item.righT_SIDE_MISALIGNMENT_DIFFERENT
      ?? item.RIGHT_SIDE_MISALIGNMENT_DIFFERENT
      ?? item.right_side_misalignment_different
      ?? null,
    leftSideAngleDifferent: item.leftSideAngleDifferent
      ?? item.LeftSideAngleDifferent
      ?? item.lefT_SIDE_ANGLE_DIFFERENT
      ?? item.LEFT_SIDE_ANGLE_DIFFERENT
      ?? item.left_side_angle_different
      ?? null,
    leftSideMisalignmentDifferent: item.leftSideMisalignmentDifferent
      ?? item.LeftSideMisalignmentDifferent
      ?? item.lefT_SIDE_MISALIGNMENT_DIFFERENT
      ?? item.LEFT_SIDE_MISALIGNNMENT_DIFFERENT
      ?? item.LEFT_SIDE_MISALIGNMENT_DIFFERENT
      ?? item.left_side_misalignment_different
      ?? null,
    dT_INS: item.dT_INS ?? item.dtIns ?? null,
    dT_AGG: item.dT_AGG ?? item.dtAgg ?? null,
  };
};

export const normalizeAcquisizioniArray = (payload) => (
  extractAcquisizioniArray(payload)
    .map(normalizeAcquisizioneRecord)
    .filter(Boolean)
);

export const normalizeSingleAcquisizione = (payload) => {
  if (!isObject(payload)) {
    return null;
  }

  const candidate = (payload.data !== undefined && !Array.isArray(payload.data))
    ? payload.data
    : payload;

  return normalizeAcquisizioneRecord(candidate);
};

export const normalizeAcquisizioniEventArray = (payload) => {
  if (hasArrayPayload(payload)) {
    return normalizeAcquisizioniArray(payload);
  }

  const singleRecord = normalizeSingleAcquisizione(payload);
  return singleRecord ? [singleRecord] : [];
};

export const normalizeAcquisizioniResponse = (payload) => {
  if (!hasArrayPayload(payload)) {
    return payload;
  }

  if (Array.isArray(payload)) {
    return normalizeAcquisizioniArray(payload);
  }

  return {
    ...payload,
    data: normalizeAcquisizioniArray(payload),
  };
};
