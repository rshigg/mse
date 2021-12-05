// TODO: REMOVE ONCE ABSURD-SQL MIGRATES TO TS
// @ts-nocheck
import initSqlJs from '@rshig/sql';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';
import { expose } from 'comlink/dist/esm/comlink';
import { v4 as uuid } from 'uuid';

import { projectSchema, Project, ProjectTypes } from '../schemas/project';
import { cardSchema, Card, ftsCardSchema, cardTriggers, SortableFields } from '../schemas/card';
import { OPERATIONS, dbPath } from './consts';
import { cardFieldsToQuery, deleteTableQueries } from './utils';
import { constructCard, RequireOne } from '../helpers';

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

    // _db.exec(deleteTableQueries(['cards', 'cards_fts', 'projects']));

    _db.exec('VACUUM;');

    _db.exec(`
      CREATE TABLE IF NOT EXISTS projects (${projectSchema});
      CREATE TABLE IF NOT EXISTS cards (${cardSchema});
      CREATE VIRTUAL TABLE IF NOT EXISTS cards_fts USING fts5(${ftsCardSchema});
      ${cardTriggers}
    `);

    // prints the info of each table
    if (process.env.NODE_ENV === 'development') {
      _db.each(`SELECT name FROM sqlite_schema WHERE type='table';`, null, (table) => {
        console.groupCollapsed(table.name);
        console.table(getTableInfo(_db, table.name));
        console.groupEnd();
      });
    }
  }

  return _db;
}

async function getAllSets(): Promise<Project[]> {
  let projects: Project[] = [];
  try {
    let db = await getDatabase();
    db.each(`SELECT * FROM projects WHERE type = '${ProjectTypes.SET}'`, null, (row: Project) =>
      projects.push(row)
    );
  } catch {
    // TODO: handle error
  }
  return projects;
}

async function getAllCards(): Promise<Card[]> {
  let cards: Card[] = [];
  try {
    let db = await getDatabase();
    db.each('SELECT * FROM cards', null, (row: Card) => {
      cards.push(row);
    });
  } catch {
    // TODO: handle error
  }
  return cards;
}

async function getProjectByCode(code: string): Promise<Project | null> {
  let db = await getDatabase();
  let project = null;
  db.each(
    `SELECT * FROM projects WHERE code = lower(?)`,
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
    code.toLowerCase(),
  ]);
  return projectId;
}

async function createSet({ name, code }: { name: string; code: string }) {
  createProject(ProjectTypes.SET, name, code);
}

async function getCardsByProjectCode(
  projectCode: string,
  sortBy: { [key in SortableFields]?: 'ASC' | 'DESC' } = { createdAt: 'ASC' }
): Promise<Card[]> {
  let db = await getDatabase();
  let query = `SELECT * FROM cards WHERE projectCode = lower(?) ORDER BY ?`;
  let orderBy = Object.entries(sortBy)
    .map(([key, value]) => `${key} ${value}`)
    .join(', ');
  let data = [projectCode, orderBy];
  let cards: Card[] = [];
  db.each(query, data, ({ id, ...card }: { id: number }) => cards.push(card as Card));
  return cards;
}

async function createCard(project: Project, fields: Partial<Card> = {}) {
  const newCard = constructCard(project, fields);
  const { query, data } = cardFieldsToQuery(newCard, OPERATIONS.INSERT);
  try {
    let db = await getDatabase();
    await db.run(query, data);
  } catch (err) {
    console.error(err, fields);
  }
}

async function batchCreateCards(project: Project, cards: Partial<Card>[]) {
  try {
    let db = await getDatabase();
    db.exec(`BEGIN TRANSACTION`);
    let { query, names } = cardFieldsToQuery(constructCard(project, {}), OPERATIONS.INSERT);
    let stmt = db.prepare(query);
    for (let card of cards) {
      let fields = constructCard(project, card);
      let { data } = cardFieldsToQuery(fields, OPERATIONS.INSERT, names);
      stmt.run(data);
    }
    db.exec(`COMMIT`);
  } catch (err) {
    console.error(err);
  }
}

async function getCardById(cardId: string): Promise<Card | null> {
  let db = await getDatabase();
  let card = null;
  db.each(`SELECT * FROM cards WHERE cardId = ?`, [cardId], (row: Card) => (card = row));
  return card;
}

async function updateCard(fields: RequireOne<Card, 'cardId'>) {
  let db = await getDatabase();
  const { query, data } = cardFieldsToQuery(fields, OPERATIONS.UPDATE);
  db.run(query, data);
}

async function deleteCard(cardId: string) {
  let db = await getDatabase();
  db.run(`DELETE FROM cards WHERE cardId = ?`, [cardId]);
}

const methods = {
  getAllSets,
  getAllCards,
  getProjectByCode,
  createSet,
  getCardsByProjectCode,
  createCard,
  batchCreateCards,
  getCardById,
  updateCard,
  deleteCard,
};

export type MainWorker = typeof methods;

init();

expose(methods);
