// TODO: REMOVE ONCE ABSURD-SQL MIGRATES TO TS
// @ts-nocheck
import initSqlJs from '@jlongster/sql.js';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';
import { expose } from 'comlink/dist/esm/comlink';

import { projectSchema, Project } from '../schemas/project';
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
      CREATE TABLE IF NOT EXISTS sets (${projectSchema});
      CREATE TABLE IF NOT EXISTS cards (${cardSchema});
    `);

    _db.exec('VACUUM;');
  }

  return _db;
}

async function getAllSets(): Promise<Project[]> {
  let db = await getDatabase();
  let sets: Project[] = [];
  db.each('SELECT * FROM sets', null, (row: Project) => sets.push(row));
  return sets;
}

async function getAllCards(): Promise<Card[]> {
  let db = await getDatabase();
  let cards: Card[] = [];
  db.each('SELECT * FROM cards', null, (row: Card) => cards.push(row));
  return cards;
}

async function getSetById(projectId: string): Promise<Project | undefined> {
  let db = await getDatabase();
  let set: Project | undefined;
  db.each(`SELECT * FROM sets WHERE projectId = ?`, [projectId], (row: Project) => {
    set = row;
  });
  return set;
}

async function createSet({ projectId, name, code }: Project) {
  let db = await getDatabase();
  db.run(`INSERT INTO sets (projectId, name, code) VALUES (?, ?, ?)`, [projectId, name, code]);
}

async function getCardsBySetId(projectId: string): Promise<Card[]> {
  let db = await getDatabase();
  let cards: Card[] = [];
  db.each(`SELECT * FROM cards WHERE projectId = ?`, [projectId], (row) => {
    const card = JSON.parse(row.data);
    cards.push(card);
  });
  return cards;
}

async function createCard(cardId: string, projectId: string) {
  let db = await getDatabase();
  const data = JSON.stringify({ cardId, projectId, ...cardDefaultValues });
  db.run(`INSERT INTO cards VALUES (?)`, [data]);
}

async function getCardById(cardId: string): Promise<Card> {
  let db = await getDatabase();
  let card;
  db.each(`SELECT * FROM cards WHERE cardId = ?`, [cardId], (row) => {
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

init();

expose(methods);
