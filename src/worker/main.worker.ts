// TODO: REMOVE ONCE ABSURD-SQL MIGRATES TO TS
// @ts-nocheck
import initSqlJs from '@rshig/sql';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';
import { expose } from 'comlink/dist/esm/comlink';
import { v4 as uuid } from 'uuid';

import { projectSchema, Project, ProjectTypes } from '../schemas/project';
import { cardDefaultValues, cardSchema, Card, ftsCardSchema, cardTriggers } from '../schemas/card';
import { OPERATIONS, dbPath } from './consts';
import { cardFieldsToQuery } from './utils';
import type { RequireOne } from '../helpers';

const getTableInfo = (db, table) => {
  const sql = `PRAGMA table_info(${table})`;
  const [{ columns, values }] = db.exec(sql);
  return values.map((row) => {
    let data = {};
    for (let i = 0; i < row.length; i++) {
      data[columns[i]] = row[i];
    }
    return data;
  });
};

const idbBackend = new IndexedDBBackend();

let ready = null;
let SQL;
let sqlFS;
async function _init() {
  SQL = await initSqlJs({ locateFile: (file) => `/db/${file}` });
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

    // prints the info of each table
    if (process.env.NODE_ENV === 'development') {
      _db.each(`SELECT name FROM sqlite_schema WHERE type='table';`, null, (table) => {
        console.groupCollapsed(table.name);
        console.table(getTableInfo(_db, table.name));
        console.groupEnd();
      });
    }

    _db.exec('VACUUM;');

    _db.exec(`
      CREATE TABLE IF NOT EXISTS projects (${projectSchema});
      CREATE TABLE IF NOT EXISTS cards (${cardSchema});
      CREATE VIRTUAL TABLE IF NOT EXISTS cards_fts USING fts5(${ftsCardSchema});
      ${cardTriggers}
    `);
  }

  return _db;
}

async function getAllSets(): Promise<Project[]> {
  try {
    let db = await getDatabase();
    let sets: Project[] = [];
    db.each(`SELECT * FROM projects WHERE type = '${ProjectTypes.SET}'`, null, (row: Project) =>
      sets.push(row)
    );
    return sets;
  } catch (error) {
    throw new Error(error);
  }
}

async function getAllCards(): Promise<Card[]> {
  try {
    let db = await getDatabase();
    let cards: Card[] = [];
    db.each('SELECT * FROM cards', null, (row: Card) => {
      cards.push(row);
    });
    return cards;
  } catch (err) {
    throw new Error(err);
  }
}

async function getProjectByCode(code: string): Promise<Project | undefined> {
  let db = await getDatabase();
  let project: Project | undefined;
  db.each(
    `SELECT * FROM projects WHERE code = upper(?)`,
    [code],
    (row: Project) => (project = row)
  );
  return project;
}

async function createProject(type: ProjectTypes, name: string, code: string) {
  let db = await getDatabase();
  let projectId = uuid();
  db.run(`INSERT INTO projects (projectId, type, name, code) VALUES (?, ?, ?, ?)`, [
    projectId,
    type,
    name,
    code.toUpperCase(),
  ]);
  return projectId;
}

async function createSet({ name, code }: { name: string; code: string }) {
  createProject(ProjectTypes.SET, name, code);
}

async function getCardsBySetId(projectId: string): Promise<Card[]> {
  let db = await getDatabase();
  let cards: Card[] = [];
  db.each(`SELECT * FROM cards WHERE projectId = ?`, [projectId], (row: Card) => cards.push(row));
  return cards;
}

async function createCard(projectId: string) {
  try {
    let db = await getDatabase();
    const newCardId = uuid();
    const fields: Card = { cardId: newCardId, projectId, ...cardDefaultValues };
    const [query, data] = cardFieldsToQuery(fields, OPERATIONS.INSERT);
    db.run(query, data);
  } catch (err) {
    console.error(err);
  }
}

async function getCardById(cardId: string): Promise<Card | undefined> {
  let db = await getDatabase();
  let card;
  db.each(`SELECT * FROM cards WHERE cardId = ?`, [cardId], (row: Card) => (card = row));
  return card;
}

async function updateCard(fields: RequireOne<Card, 'cardId'>) {
  let db = await getDatabase();
  const [query, data] = cardFieldsToQuery(fields, OPERATIONS.UPDATE);
  db.run(query, data);
}

const methods = {
  getAllSets,
  getAllCards,
  getProjectByCode,
  createSet,
  getCardsBySetId,
  createCard,
  getCardById,
  updateCard,
};

export type MainWorker = typeof methods;

init();

expose(methods);
