// TODO: REMOVE ONCE ABSURD-SQL MIGRATES TO TS
// @ts-nocheck
import initSqlJs from '@rshig/sql';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';
import { expose } from 'comlink/dist/esm/comlink';
import { v4 as uuid } from 'uuid';

import { projectSchema, Project, ProjectTypes } from '../schemas/project';
import { cardSchema, Card, ftsCardSchema, cardTriggers, SortableFields } from '../schemas/card';
import { OPERATIONS, dbPath, dbVersion } from './consts';
import { cardFieldsToQuery, deleteTableQueries } from './utils';
import { constructCard, RequireOne } from '../helpers';

const idbBackend = new IndexedDBBackend();

class DB {
  ready: boolean;

  constructor() {
    this.SQL = null;
    this.sqlFS = null;
    this.db = null;
    this.ready = false;
  }

  getTableInfo(table: string, db = this.db) {
    const sql = `PRAGMA table_info(${table})`;
    const [{ columns, values }] = db.exec(sql);
    return values.map((row) => {
      let data = {};
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
      let stream = this.SQL.FS.open(dbPath, 'a+');
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
      let _db = new this.SQL.Database(dbPath, { filename: true });

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
    let db = await this.getDatabase();
    db.exec(`
      BEGIN TRANSACTION;
      ${deleteTableQueries(tableNames)}
      COMMIT;
    `);
  }

  async getAllSets(): Promise<Project[]> {
    let projects: Project[] = [];
    try {
      let db = await this.getDatabase();
      db.each(`SELECT * FROM projects WHERE type = '${ProjectTypes.SET}'`, null, (row: Project) =>
        projects.push(row)
      );
    } catch {
      // TODO: handle error
    }
    return projects;
  }

  async getAllCards(): Promise<Card[]> {
    let cards: Card[] = [];
    try {
      let db = await this.getDatabase();
      db.each('SELECT * FROM cards', null, (row: Card) => {
        cards.push(row);
      });
    } catch {
      // TODO: handle error
    }
    return cards;
  }

  async getProjectByCode(code: string): Promise<Project | null> {
    let db = await this.getDatabase();
    let project = null;
    db.each(
      `SELECT * FROM projects WHERE code = lower(?)`,
      [code],
      (row: Project) => (project = row)
    );
    return project;
  }

  async createProject(type: ProjectTypes, name: string, code: string) {
    let db = await this.getDatabase();
    let projectId = uuid();
    db.run(`INSERT INTO projects (projectId, type, name, code) VALUES (?, ?, ?, ?)`, [
      projectId,
      type,
      name,
      code.toLowerCase(),
    ]);
    return projectId;
  }

  async createSet({ name, code }: { name: string; code: string }) {
    this.createProject(ProjectTypes.SET, name, code);
  }

  async getCardsByProjectCode(
    projectCode: string,
    sortBy: SortableFields = 'createdAt',
    sortDir: 'ASC' | 'DESC' = 'DESC'
  ): Promise<Card[]> {
    let cards: Card[] = [];
    let query = `SELECT * FROM cards WHERE projectCode = lower(?) ORDER BY ${sortBy} ${sortDir}`;
    let data = [projectCode];
    try {
      let db = await this.getDatabase();
      db.each(query, data, ({ id, ...card }: { id: number }) => cards.push(card as Card));
    } catch (err) {
      console.error(err);
    }
    return cards;
  }

  async createCard(project: Project, fields: Partial<Card> = {}) {
    const newCard = constructCard(project, fields);
    const { query, data } = cardFieldsToQuery(newCard, OPERATIONS.INSERT);
    try {
      let db = await this.getDatabase();
      await db.run(query, data);
    } catch (err) {
      console.error(err, fields);
    }
  }

  async batchCreateCards(project: Project, cards: Partial<Card>[]) {
    try {
      let db = await this.getDatabase();
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

  async getCardById(cardId: string): Promise<Card | null> {
    let db = await this.getDatabase();
    let card = null;
    db.each(`SELECT * FROM cards WHERE cardId = ?`, [cardId], (row: Card) => (card = row));
    return card;
  }

  async updateCard(fields: RequireOne<Card, 'cardId'>) {
    let db = await this.getDatabase();
    const { query, data } = cardFieldsToQuery(fields, OPERATIONS.UPDATE);
    db.run(query, data);
  }

  async deleteCard(cardId: string) {
    let db = await this.getDatabase();
    db.run(`DELETE FROM cards WHERE cardId = ?`, [cardId]);
  }
}

const db = new DB();

export type DBClass = typeof db;

expose(db);
