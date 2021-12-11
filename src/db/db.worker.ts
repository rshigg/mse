// TODO: REMOVE ONCE ABSURD-SQL MIGRATES TO TS
// @ts-nocheck
import initSqlJs from '@rshig/sql';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';
import { expose } from 'comlink/dist/esm/comlink';
import { v4 as uuid } from 'uuid';

import { objectToSchema, fieldsToQuery, deleteTableQueries } from '../utils/db';
import { constructCard, RequireOne } from '../utils/helpers';
import { OPERATIONS, dbPath, dbVersion } from './consts';

import { Project, projectFields, projectTypes } from '../schemas/project';
import {
  Card,
  cardFields,
  internalFields,
  ftsFields,
  cardTriggers,
  SortableFields,
} from '../schemas/card';

const projectSchema = objectToSchema(projectFields);
const cardSchema = objectToSchema({ ...internalFields, ...cardFields });
const ftsCardSchema = `
  ${objectToSchema(ftsFields)},
  content='cards',
  content_rowid='id'
`;

const idbBackend = new IndexedDBBackend();

const createCardQuery = (
  fields: Partial<Card>,
  operation: OPERATIONS.INSERT | OPERATIONS.UPDATE,
  fieldsToUse?: Array<keyof Card>
) => {
  return fieldsToQuery(fields, operation, 'cards', 'cardId', fieldsToUse);
};

class DB {
  ready: boolean;
  SQL: unknown;
  sqlFS: unknown;
  db: unknown;

  constructor() {
    this.SQL = null;
    this.sqlFS = null;
    this.db = null;
    this.ready = false;
  }

  get isReady() {
    return this.ready;
  }

  getTableInfo(table: string, db = this.db) {
    const sql = `PRAGMA table_info(${table})`;
    const [{ columns, values }] = db.exec(sql);
    return values.map((row) => {
      const data = {};
      for (let i = 0; i < row.length; i++) {
        data[columns[i]] = row[i];
      }
      return data;
    });
  }

  async _init() {
    this.SQL = await initSqlJs({ locateFile: (file) => `/db/${file}` });
    this.sqlFS = new SQLiteFS(this.SQL.FS, idbBackend);
    this.SQL.register_for_idb(this.sqlFS);

    this.SQL.FS.mkdir('/sql');
    this.SQL.FS.mount(this.sqlFS, {}, '/sql');

    if (typeof SharedArrayBuffer === 'undefined') {
      const stream = this.SQL.FS.open(dbPath, 'a+');
      await stream.node.contents.readIfFallback();
      this.SQL.FS.close(stream);
    }
  }

  async init() {
    if (this.ready) return;

    try {
      await this._init();
      this.ready = true;
    } catch (error) {
      console.error(error);
    }
  }

  async getDatabase() {
    await this.init();
    if (this.db == null) {
      const _db = new this.SQL.Database(dbPath, { filename: true });

      _db.exec(`
        PRAGMA journal_mode=MEMORY;
        PRAGMA foreign_keys=ON;
        PRAGMA user_version=${dbVersion};
      `);

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
          console.table(this.getTableInfo(table.name, _db));
          console.groupEnd();
        });
      }

      this.db = _db;
    }

    return this.db;
  }

  async deleteTable(tableNames: string[]) {
    const db = await this.getDatabase();
    db.exec(`
      BEGIN TRANSACTION;
      ${deleteTableQueries(tableNames)}
      COMMIT;
    `);
  }

  async getAllSets(): Promise<Project[]> {
    const projects: Project[] = [];
    try {
      const db = await this.getDatabase();
      db.each(`SELECT * FROM projects WHERE type = '${projectTypes.SET}'`, null, (row: Project) =>
        projects.push(row)
      );
    } catch {
      // TODO: handle error
    }
    return projects;
  }

  async getAllCards(): Promise<Card[]> {
    const cards: Card[] = [];
    try {
      const db = await this.getDatabase();
      db.each('SELECT * FROM cards', null, (row: Card) => {
        cards.push(row);
      });
    } catch {
      // TODO: handle error
    }
    return cards;
  }

  async getProjectByCode(code: string): Promise<Project | null> {
    const db = await this.getDatabase();
    let project = null;
    db.each(
      `SELECT * FROM projects WHERE code = lower(?)`,
      [code],
      (row: Project) => (project = row)
    );
    return project;
  }

  async createProject(type: string, name: string, code: string) {
    const db = await this.getDatabase();
    const projectId = uuid();
    db.run(`INSERT INTO projects (projectId, type, name, code) VALUES (?, ?, ?, ?)`, [
      projectId,
      type,
      name,
      code.toLowerCase(),
    ]);
    return projectId;
  }

  async createSet({ name, code }: { name: string; code: string }) {
    this.createProject(projectTypes.SET, name, code);
  }

  async getCardsByProjectCode(
    projectCode: string,
    sortBy: SortableFields = 'createdAt',
    sortDir: 'ASC' | 'DESC' = 'DESC'
  ): Promise<Card[]> {
    const cards: Card[] = [];
    const query = `SELECT * FROM cards WHERE projectCode = lower(?) ORDER BY ${sortBy} ${sortDir}`;
    const data = [projectCode];
    try {
      const db = await this.getDatabase();
      db.each(query, data, ({ id, ...card }: { id: number }) => cards.push(card as Card));
    } catch (err) {
      console.error(err);
    }
    return cards;
  }

  async createCard(project: Project, fields: Partial<Card> = {}) {
    const newCard = constructCard(project, fields);
    const { query, data } = createCardQuery(newCard, OPERATIONS.INSERT);
    try {
      const db = await this.getDatabase();
      await db.run(query, data);
    } catch (err) {
      console.error(err, fields);
    }
  }

  async batchCreateCards(project: Project, cards: Partial<Card>[]) {
    try {
      const db = await this.getDatabase();
      db.exec(`BEGIN TRANSACTION`);
      const { query, names } = createCardQuery(constructCard(project, {}), OPERATIONS.INSERT);
      const stmt = db.prepare(query);
      for (const card of cards) {
        const fields = constructCard(project, card);
        const { data } = createCardQuery(fields, OPERATIONS.INSERT, names as Array<keyof Card>);
        stmt.run(data);
      }
      db.exec(`COMMIT`);
    } catch (err) {
      console.error(err);
    }
  }

  async getCardById(cardId: string): Promise<Card | null> {
    const db = await this.getDatabase();
    let card = null;
    db.each(`SELECT * FROM cards WHERE cardId = ?`, [cardId], (row: Card) => (card = row));
    return card;
  }

  async updateCard(fields: RequireOne<Card, 'cardId'>) {
    const db = await this.getDatabase();
    const { query, data } = fieldsToQuery(fields, OPERATIONS.UPDATE, 'cards', 'cardId');
    db.run(query, data);
  }

  async deleteCard(cardId: string) {
    const db = await this.getDatabase();
    db.run(`DELETE FROM cards WHERE cardId = ?`, [cardId]);
  }
}

const db = new DB();

export type DBClass = typeof db;

expose(db);
