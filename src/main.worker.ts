// @ts-nocheck
import initSqlJs from '@jlongster/sql.js';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';
import { expose } from 'comlink/dist/esm/comlink';

import { cardSchema } from './schemas/card';

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
        code CHAR(3) NOT NULL
        lang CHAR(2) DEFAULT 'en'
      ); \
      CREATE VIRTUAL TABLE IF NOT EXISTS cards USING fts3(${cardSchema});
    `);

    _db.exec('VACUUM');
  }

  return _db;
}

async function getAllSets() {
  let db = await getDatabase();
  let sets = [];
  let stmt = db.prepare(`SELECT * FROM sets`);
  while (stmt.step()) {
    let row = stmt.getAsObject();
    sets.push(row);
  }
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

async function createSet({ set_id, name, code }: { set_id: String; name: String; code: String }) {
  let db = await getDatabase();
  let stmt = db.prepare(`INSERT INTO sets (set_id, name, code) VALUES (?, ?, ?)`);
  stmt.run([set_id, name, code]);
  stmt.free();
  return await getSetById(set_id);
}

async function getCardsByset_id(set_id: String) {
  let db = await getDatabase();
  let cards = [];
  let stmt = db.prepare(`SELECT * FROM cards WHERE set_id = ?`);
  stmt.run([set_id]);
  while (stmt.step()) {
    let row = stmt.getAsObject();
    cards.push(row);
  }
  stmt.free();

  return cards;
}

async function createCard(cardId: String, set_id: String) {
  let db = await getDatabase();
  let stmt = db.prepare(`INSERT INTO cards (cardId, set_id) VALUES (?, ?)`);
  stmt.run([cardId, set_id]);
  stmt.free();
}

init();

// if (typeof self !== 'undefined') {
//   const pm = (type, data) => {
//     self.postMessage({ type, ...data });
//   };

//   self.onmessage = async (msg) => {
//     logWorkerMessage(msg);

//     switch (msg.data.type) {
//       case 'init': {
//         const sets = await getAllSets();
//         pm('init', { sets });
//         break;
//       }
//       case 'get_set': {
//         const { set_id } = msg.data;
//         if (set_id) {
//           let set = await getSet(msg.data.set_id);
//           pm('set', { set });
//         }
//         break;
//       }
//       case 'create_set': {
//         let set = await createSet(msg.data.values);
//         pm('set', { set });
//         break;
//       }
//       default:
//         break;
//     }
//   };
// }

const methods = {
  getAllSets,
  getSetById,
  createSet,
  getCardsByset_id,
  createCard,
};

export type MainWorker = typeof methods;

expose(methods);
