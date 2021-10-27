export type Project = {
  projectId: string;
  type: string;
  name: string;
  code: string;
  lang?: string;
};

export const projectDefaultValues: Project = {
  projectId: '',
  type: 'set',
  name: '',
  code: '',
  lang: 'en',
};

export const projectSchema = `
  projectId TEXT PRIMARY KEY,
  type TEXT DEFAULT 'set',
  name TEXT NOT NULL,
  code CHAR(3) NOT NULL,
  lang CHAR(2) DEFAULT 'en'
`;
