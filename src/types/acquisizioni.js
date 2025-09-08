/**
 * JSDoc type definitions for Acquisizioni data model
 * This file provides type documentation for better development experience
 */

/**
 * @typedef {Object} AcquisizioneDto
 * @property {number} id
 * @property {string} coD_LINEA
 * @property {string} coD_POSTAZIONE
 * @property {string} [fotO_SUPERIORE]
 * @property {string} [fotO_FRONTALE]
 * @property {string} [fotO_BOX]
 * @property {boolean} [esitO_CQ_ARTICOLO]
 * @property {boolean} [esitO_CQ_BOX]
 * @property {string} [confidenzA_CQ_BOX]
 * @property {string} [scostamentO_CQ_ARTICOLO]
 * @property {string} [codicE_ARTICOLO]
 * @property {string} [codicE_ORDINE]
 * @property {string} dT_INS
 * @property {string} dT_AGG
 * @property {boolean} abilitA_CQ
 */

/**
 * @typedef {'Connected'|'Connecting'|'Reconnecting'|'Disconnected'} ConnectionState
 */

/**
 * @typedef {Object} UseAcquisizioniRealtimeReturn
 * @property {import('@microsoft/signalr').HubConnection|null} connection
 * @property {ConnectionState} connectionState
 * @property {string|null} connectionId
 * @property {boolean} isLoading
 * @property {string|null} error
 * @property {AcquisizioneDto[]} acquisizioni
 * @property {string|null} lastUpdated
 * @property {number} recordCount
 * @property {function(): Promise<void>} connect
 * @property {function(): Promise<void>} disconnect
 * @property {function(): Promise<void>} reconnect
 * @property {function(string, ...any): Promise<boolean>} sendMessage
 * @property {function(): Promise<void>} refreshData
 * @property {boolean} isConnected
 * @property {boolean} isConnecting
 * @property {boolean} isReconnecting
 * @property {boolean} isDisconnected
 */

/**
 * @typedef {Object} SignalREvents
 * @property {function(string): void} Connected
 * @property {function(AcquisizioneDto[]): void} AcquisizioniUpdated
 * @property {function(string): void} Error
 */

/**
 * @typedef {Object} ApiResponse
 * @property {any} data
 * @property {boolean} success
 * @property {string} [message]
 * @property {number} [total]
 * @property {number} [page]
 * @property {number} [pageSize]
 */

/**
 * @typedef {Object} AcquisizioniQueryParams
 * @property {number} [page]
 * @property {number} [pageSize]
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {string} [codLinea]
 * @property {string} [codiceArticolo]
 * @property {string} [codiceOrdine]
 */

/**
 * @typedef {Object} ExportOptions
 * @property {'csv'|'excel'|'json'} format
 * @property {Object} [dateRange]
 * @property {Date} dateRange.start
 * @property {Date} dateRange.end
 * @property {AcquisizioniQueryParams} [filters]
 */

/**
 * @typedef {Object} ConnectionStatusProps
 * @property {ConnectionState} connectionState
 * @property {string|null} connectionId
 * @property {string|null} error
 * @property {number} recordCount
 * @property {string|null} lastUpdated
 * @property {function(): void} onReconnect
 * @property {function(): void} onRefresh
 * @property {boolean} isLoading
 */

/**
 * @typedef {Object} AcquisizioniTableProps
 * @property {AcquisizioneDto[]} acquisizioni
 * @property {boolean} isLoading
 * @property {boolean} showDetails
 * @property {function(AcquisizioneDto): void} [onRecordClick]
 * @property {function(): void} onToggleDetails
 */

/**
 * @typedef {Object} AcquisizioneDetailModalProps
 * @property {AcquisizioneDto|null} record
 * @property {boolean} isOpen
 * @property {function(): void} onClose
 */

// Export types for documentation purposes
export {};
