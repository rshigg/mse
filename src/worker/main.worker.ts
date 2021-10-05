// @ts-nocheck
import initSqlJs from '@jlongster/sql.js';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';
import { expose } from 'comlink/dist/esm/comlink';

import { cardSchema } from '../schemas/card';
import { CardSet } from 'schemas/set';

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
async function getDatabase() {
  await init();
  if (_db == null) {
    _db = new SQL.Database(dbPath, { filename: true });

    _db.exec(`
      PRAGMA page_size=8192;
      PRAGMA journal_mode=MEMORY
    `);

    _db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS sets USING fts3(
        set_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code CHAR(3) NOT NULL,
        lang CHAR(2) DEFAULT "en"
      ); \
      CREATE VIRTUAL TABLE IF NOT EXISTS cards USING fts3(${cardSchema});
    `);

    _db.exec('VACUUM');
  }

  return _db;
}

function getRows(stmt) {
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  return rows;
}

async function getAllSets() {
  let db = await getDatabase();
  let stmt = db.prepare(`SELECT * FROM sets`);
  const sets = getRows(stmt);
  stmt.free();

  return sets;
}

async function getSetById(set_id: String) {
  let db = await getDatabase();
  let stmt = db.prepare(`SELECT * FROM sets WHERE set_id = ? LIMIT 1`);
  stmt.bind([set_id]);
  stmt.step();
  let set = stmt.getAsObject();
  stmt.free();

  return set;
}

async function createSet({ set_id, name, code, lang = 'en' }: CardSet) {
  let db = await getDatabase();
  let stmt = db.prepare(`INSERT INTO sets (set_id, name, code, lang) VALUES (?, ?, ?, ?)`);
  stmt.run([set_id, name, code, lang]);
  stmt.free();
  return await getSetById(set_id);
}

async function getCardsBySetId(set_id: String) {
  let db = await getDatabase();
  let stmt = db.prepare(`SELECT * FROM cards WHERE set_id = ?`);
  stmt.run([set_id]);
  const cards = getRows(stmt);
  stmt.free();

  return cards;
}

async function createCard(card_id: String, set_id: String) {
  let db = await getDatabase();
  let stmt = db.prepare(`INSERT INTO cards (card_id, set_id) VALUES (?, ?)`);
  stmt.run([card_id, set_id]);
  stmt.free();
}

const methods = {
  getAllSets,
  getSetById,
  createSet,
  getCardsBySetId,
  createCard,
};

export type MainWorker = typeof methods;

init();

expose(methods);
