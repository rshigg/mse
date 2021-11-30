import { fieldsToSchema } from './utils';

export enum ProjectTypes {
  SET = 'set',
}

export type Project = {
  projectId: string;
  type: string;
  name: string;
  code: string;
  lang?: string;
};

export type ProjectDefaultValues = {
  name: string;
  code: string;
};

export const projectDefaultValues: ProjectDefaultValues = {
  name: '',
  code: '',
};

// the explicit type is to make sure that projectFields
// has all the same fields as Project
export const projectFields: Record<keyof Project, string> = {
  projectId: `TEXT PRIMARY KEY`,
  type: `TEXT NOT NULL`,
  name: `TEXT NOT NULL`,
  code: `CHAR(3) NOT NULL`,
  lang: `CHAR(2) DEFAULT 'en'`,
};

export const projectSchema = fieldsToSchema(projectFields);
