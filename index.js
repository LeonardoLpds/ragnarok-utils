'use strict';

const growl = require('notify-send');
const { fetchItem, downloadImage } = require('./lib/functions.js')

const item = process.argv[2];

if (!item) {
  growl.icon('error').notify('No item received');
  return 1;
}

fetchItem(item).then(async r => {
  if (!r.data || !r.data[0]) {
    growl.icon('error').notify('No data received');
    return 1;
  }

  let data = r.data[0];

  let value = 'Ƶ ' + Number(data.lastRecord.price).toLocaleString() + ` (${Math.round(data.priceChange1d)}%)`;

  if (
    data.lastRecord.snapEnd > 0 &&
    data.lastRecord.snapEnd > new Date().getTime() / 1000
  ) {
    value += `\n<i>(in snap until ${new Date(
      data.lastRecord.snapEnd * 1000
    ).toLocaleString()})</i>`;

    value += `\n[<b>Stock</b>: ${data.lastRecord.stock} | <b>Buyers</b>: ${data.lastRecord.snapBuyers}]`
  }

  const fileName = data.name
    .replace(/\+\d+|\[\d+\]|\(.+\)|\<.+\>/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

  const filePath = `${__dirname}/images/${fileName}.png`;

  await downloadImage(`${data.icon}.png`, filePath);

  console.log(`[${(new Date()).toLocaleString()}] ${data.name}: ${Number(data.lastRecord.price).toLocaleString()}`);
  growl.icon(filePath).notify(data.name, value);
});