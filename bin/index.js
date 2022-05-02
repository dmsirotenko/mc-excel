#!/usr/bin/env node

const util = require('util');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const merge = require('lodash/merge');
const random = require('lodash/random');
const size = require('lodash/size');

const ExcelJS = require('exceljs');

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
  .help('help')
  .argv;

const {
  getReceipts,
  getFiscalData,
  processFailedRequest,
} = require('../src/request')(OPTIONS.token);

const sleep = util.promisify(setTimeout);

begin()
  .catch((error) => console.error(error.toString()));

async function begin() {
  const {
    brands,
    receipts,
  } = await listReceiptsForPeriod();

  console.log(`Grouped ${size(brands)} brands`);
  console.log(`Fetched ${size(receipts)} receipts`);

  const details = await fetchFiscalDetails(receipts);

  console.log(`Fetched details for ${size(details)} receipts`);

  const result = details.map(([receipt, fiscal]) => {
    const brand = brands[receipt.brandId];

    return [brand, receipt, fiscal];
  })

  convertToWorkbook(result);
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
    .then((nested) => merge(result, nested))
    .then(() => result);
}

async function fetchFiscalDetails(receipts = []) {
  const result = [];

  while (receipts.length > 0) {
    const receipt = receipts.shift();

    console.log(`Fetching details for receipt ${receipt.key}`);

    await getFiscalData(receipt.key)
      .then(({ data }) => result.push([receipt, data]))
      .then(() => sleep(random(3000, 7000, true)))
      .catch(processFailedRequest);
  }

  return result;
}

function convertToWorkbook(receipts = []) {
  console.log(receipts);
}
