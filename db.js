// db.js
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const settingsAdapter = new FileSync('settings.json');
const resultsAdapter = new FileSync('results.json');
const favoritesAdapter = new FileSync('favorites.json');

const db = low(settingsAdapter);

db.defaults({
  settings: { baseUrl: '', prev: -1, current: 0, next: 1, limit: 10, keyword: '', skip: 0 },
  results: [],
  favorites: []
}).write();

const resultsDb = low(resultsAdapter);
const favoritesDb = low(favoritesAdapter);

module.exports = { db, resultsDb, favoritesDb };
