// @ts-nocheck
import initSqlJs from '@jlongster/sql.js';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';
import { expose } from 'comlink/dist/esm/comlink';

import { setSchema, CardSet } from '../schemas/set';
import { cardDefaultValues, cardSchema, Card } from '../schemas/card';

const idbBackend = new IndexedDBBackend();
const dbPath = '/sql/mse.sqlite';

let ready = null;
let SQL;
let sqlFS;
async function _init() {
  SQL = await initSqlJs({ locateFile: (file) => file });
  sqlFS = new SQLiteFS(SQL.FS, idbBackend);
  SQL.register_for_idb(sqlFS);

  SQL.FS.mkdir('/sql');
  SQL.FS.mount(sqlFS, {}, '/sql');

  if (typeof SharedArrayBuffer === 'undefined') {
    let stream = SQL.FS.open(dbPath, 'a+');
    await stream.node.contents.readIfFallback();
    SQL.FS.close(stream);
  }
}

function init() {
  if (ready) {
    return ready;
  }

  ready = _init();
}

let _db = null;
let version = 1;
async function getDatabase() {
  await init();
  if (_db == null) {
    _db = new SQL.Database(dbPath, { filename: true });

    _db.exec(`
      PRAGMA journal_mode=MEMORY;
      PRAGMA foreign_keys=ON;
      PRAGMA user_version=${version};
    `);

    _db.exec(`
      CREATE TABLE IF NOT EXISTS sets (${setSchema});
      CREATE TABLE IF NOT EXISTS cards (${cardSchema});
    `);

    _db.exec('VACUUM;');
  }

  return _db;
}

async function getAllSets(): Promise<CardSet[]> {
  let db = await getDatabase();
  let sets = [];
  db.each('SELECT * FROM sets', null, (row) => sets.push(row));
  return sets;
}

async function getAllCards() {
  let db = await getDatabase();
  let cards = [];
  db.each('SELECT * FROM cards', null, (row) => cards.push(row));
  return cards;
}

async function getSetById(set_id: string): Promise<CardSet> {
  let db = await getDatabase();
  let set;
  db.each(`SELECT * FROM sets WHERE set_id = ?`, [set_id], (row) => {
    set = row;
  });
  return set;
}

async function createSet({ set_id, name, code, lang = 'en' }: CardSet) {
  let db = await getDatabase();
  db.run(`INSERT INTO sets (set_id, name, code, lang) VALUES (?, ?, ?, ?)`, [
    set_id,
    name,
    code,
    lang,
  ]);
}

async function getCardsBySetId(set_id: string): Promise<Card[]> {
  let db = await getDatabase();
  let cards = [];
  db.each(`SELECT * FROM cards WHERE set_id = ?`, [set_id], (row) => {
    const card = JSON.parse(row.data);
    cards.push(card);
  });
  return cards;
}

async function createCard(card_id: string, set_id: string) {
  let db = await getDatabase();
  const data = JSON.stringify({ card_id, set_id, ...cardDefaultValues });
  db.run(`INSERT INTO cards VALUES (?)`, [data]);
}

async function getCardById(card_id: string): Promise<Card> {
  let db = await getDatabase();
  let card;
  db.each(`SELECT * FROM cards WHERE card_id = ?`, [card_id], (row) => {
    card = JSON.parse(row.data);
  });

  return card;
}

const methods = {
  getAllSets,
  getAllCards,
  getSetById,
  createSet,
  getCardsBySetId,
  createCard,
  getCardById,
};

export type MainWorker = typeof methods;

await init();

expose(methods);
