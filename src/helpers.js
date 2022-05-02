const mapValues = require('lodash/mapValues');
const isPlainObject = require('lodash/isPlainObject');
const merge = require('lodash/merge');
const isArray = require('lodash/isArray');
const concat = require('lodash/concat');

function mergeObjects(dest, source) {
  return mapValues(dest, (value, key) => {
    const newValue = source[key];

    if (isPlainObject(value)) {
      return merge(value, newValue);
    } else if (isArray(value)) {
      return concat(value, newValue);
    }

    return newValue;
  });
}

async function processItemsQueue(items, processor) {
  const queue = Array.from(items);

  while (queue.length > 0) {
    await processor(queue.shift());
  }
}

module.exports = {
  mergeObjects,
  processItemsQueue,
}
