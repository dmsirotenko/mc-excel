const Format = {
  XLSX: 'xlsx',
};

const FiscalKey = {
  TOTAL_SUM: 'totalSum',
  CASH_TOTAL_SUM: 'cashTotalSum',
  ECASH_TOTAL_SUM: 'ecashTotalSum',
  CREDIT_SUM: 'creditSum',
  USER_INN: 'userInn',
  SHIFT_NUMBER: 'shiftNumber',
  REQUEST_NUMBER: 'requestNumber',
  DATE_TIME: 'dateTime',
  FISCAL_DOC_NUMBER: 'fiscalDocumentNumber',
  FISCAL_DIC_FORMAT_VER: 'fiscalDocumentFormatVer',
  FISCAL_DRIVE_NUMBER: 'fiscalDriveNumber',
  KKT_REG_ID: 'kktRegId',
  FISCAL_SIGN: 'fiscalSign',
  OPERATOR: 'operator',
  RETAIL_PLACE: 'retailPlace',
  RETAIL_PLACE_ADDRESS: 'retailPlaceAddress',
};

const FISCAL_MAPPING = {
  [FiscalKey.TOTAL_SUM]: 'Итог',
  [FiscalKey.CASH_TOTAL_SUM]: 'Наличные',
  [FiscalKey.ECASH_TOTAL_SUM]: 'Безналичные',
  [FiscalKey.CREDIT_SUM]: 'Предоплата (аванс)',
  [FiscalKey.USER_INN]: 'ИНН',
  [FiscalKey.SHIFT_NUMBER]: '№ смены',
  [FiscalKey.REQUEST_NUMBER]: 'Чек №',
  [FiscalKey.DATE_TIME]: 'Дата/Время',
  [FiscalKey.FISCAL_DOC_NUMBER]: 'ФД №',
  [FiscalKey.FISCAL_DIC_FORMAT_VER]: 'Версия ФФД',
  [FiscalKey.FISCAL_DRIVE_NUMBER]: 'ФН',
  [FiscalKey.KKT_REG_ID]: 'РН ККТ',
  [FiscalKey.FISCAL_SIGN]: 'ФП',
  [FiscalKey.OPERATOR]:'Кассир',
  [FiscalKey.RETAIL_PLACE]: 'Место расчетов',
  [FiscalKey.RETAIL_PLACE_ADDRESS]: 'Адрес расчетов',
};

module.exports = {
  Format,
  FISCAL_MAPPING,
};
