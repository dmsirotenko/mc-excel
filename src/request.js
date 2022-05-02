const axios = require('axios');

const { API_BASE_URL, HEADERS } = require('./config');

function validateStatus(status) {
  return status >= 200 && status < 400;
}

module.exports = (token) => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      ...HEADERS,
      'Authorization': `Bearer ${token}`,
    },
    validateStatus,
  });

  async function processFailedRequest(error) {
    const {
      code,
      response: { data },
    } = error

    console.error(`${code}: ${data.message}`);

    throw error;
  }

  async function getReceipts(dateFrom, dateTo, offset = 0, limit = 10) {
    const data = {
      orderBy: 'RECEIVE_DATE:DESC',
      kktOwner: null,
      inn: null,
      dateFrom,
      dateTo,
      offset,
      limit,
    };

    return client.post('/receipt', data);
  }

  async function getFiscalData(key) {
    if (typeof key !== 'string') {
      throw new TypeError('Key is not a string');
    }

    return client.post('/receipt/fiscal_data', { key });
  }

  return {
    getReceipts,
    getFiscalData,

    processFailedRequest,
  };
}
