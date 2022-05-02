#!/usr/bin/env node

const util = require('util');
const path = require('path');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const random = require('lodash/random');
const size = require('lodash/size');

const ExcelJS = require('exceljs');

const {
  Format,
  FISCAL_MAPPING,
} = require('../src/constants');

const {
  mergeObjects,
  processItemsQueue,
} = require('../src/helpers');

const WORKING_DIR = process.cwd();

const OPTIONS = yargs(hideBin(process.argv))
  .option('t', {
    alias: 'token',
    describe: 'JWT-token for mco.nalog.ru',
    type: 'string',
    demandOption: true,
  })
  .option('s', {
    alias: 'start',
    describe: 'Receipts start date',
    type: 'string',
    demandOption: true,
  })
  .option('e', {
    alias: 'end',
    describe: 'Receipts end date',
    type: 'string',
    demandOption: true,
  })
  .option('f', {
    alias: 'format',
    describe: 'Export file format',
    type: 'string',
    default: Format.XLSX,
  })
  .help('help')
  .argv;

const {
  getReceipts,
  getFiscalData,
  processFailedRequest,
} = require('../src/request')(OPTIONS.token);

const sleep = util.promisify(setTimeout);

begin()
  .then(() => console.info('Successfully exported requested receipts'))
  .catch((error) => console.error(error.toString()));

async function begin() {
  const {
    brands,
    receipts,
  } = await listReceiptsForPeriod();

  console.info(`Grouped ${size(brands)} brands`);
  console.info(`Fetched ${size(receipts)} receipts`);

  const fiscal = await fetchFiscalDetails(receipts);

  console.info(`Fetched fiscal details for ${size(fiscal)} receipts`);

  const result = receipts.map((receipt, index) => {
    const brand = brands[receipt.brandId];
    const details = fiscal[index];

    return [brand, receipt, details];
  })

  return convert(result);
}

async function listReceiptsForPeriod(offset = 0, limit = 10) {
  console.log(`Getting receipts: ${offset} -> ${offset + limit}`);

  const { receipts, brands: orig, hasMore } = await getReceipts(OPTIONS.start, OPTIONS.end, offset, limit)
    .then(({ data }) => data)
    .catch(processFailedRequest);

  const brands = orig.reduce((acc, brand) => {
    acc[brand.id] = brand;

    return acc;
  }, {});

  const result = { brands, receipts };

  if (!hasMore) {
    return result;
  }

  await sleep(random(2000, 4000, true));

  return listReceiptsForPeriod(offset + limit, limit)
    .then((nested) => mergeObjects(result, nested));
}

async function fetchFiscalDetails(receipts = []) {
  const result = [];

  await processItemsQueue(receipts, async ({ key }) => {
    console.log(`Fetching details for receipt ${key}`);

    return getFiscalData(key)
      .then(({ data }) => result.push(data))
      .then(() => sleep(random(3000, 7000, true)))
      .catch(processFailedRequest);
  });

  return result;
}

async function convert(...args) {
  switch (OPTIONS.format) {
    case Format.XLSX:
      return convertToWorkbook(...args);
    default:
      throw new TypeError('Unknown export format');
  }
}

async function convertToWorkbook(receipts = []) {
  const workbook = new ExcelJS.Workbook();

  await processItemsQueue(receipts, ([brand, receipt, fiscal]) => {
    const { kktOwner, receiveDate, fiscalDocumentNumber: num } = receipt;

    const sheetName = `${brand?.name || kktOwner} ${receiveDate.split('T')[0]} (${num})`;

    console.log(`Creating worksheet named ${sheetName}`);

    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = [
      { header: 'Предмет расчета', key: 'name', width: 50 },
      { header: 'Кол-во', key: 'quantity', width: 10 },
      { header: 'Стоимость', key: 'price', width: 20 },
      { header: 'Сумма', key: 'sum', width: 30 },
    ];

    fiscal.items.forEach((item) => worksheet.addRow(item));

    const shift = worksheet.columns.length + 7;

    const labelCol = worksheet.getColumn(shift);
    const valueCol = worksheet.getColumn(shift + 1);

    labelCol.width = 15;
    labelCol.values = Object.values(FISCAL_MAPPING);

    valueCol.width = 25;
    valueCol.values = Object.keys(FISCAL_MAPPING)
      .map((key) => fiscal[key]);
  });

  const bookName = `MCO ${OPTIONS.start} – ${OPTIONS.end} ${new Date().toISOString()}`;
  const dest = path.join(WORKING_DIR, `${bookName}.xlsx`);

  console.log(`Writing workbook to file ${dest}`);

  return workbook.xlsx.writeFile(dest);
}
