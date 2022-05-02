const API_BASE_URL = 'https://mco.nalog.ru/api/v1';

const {
  origin: ORIGIN,
  host: HOST,
} = new URL(API_BASE_URL);

const HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Encoding':'gzip, deflate, br',
  'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
  'Connection': 'keep-alive',
  'Content-Type': 'application/json;charset=UTF-8',
  'Host': HOST,
  'Origin': ORIGIN,
  'Referer': `${ORIGIN}/`,
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
};

module.exports = {
  API_BASE_URL,
  HEADERS,
};
