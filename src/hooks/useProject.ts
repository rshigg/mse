import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRegisterActions } from 'kbar';

import { useLocalDB } from 'db/LocalDBContext';
import { Project } from 'schemas/project';

const useProject = (code?: string) => {
  const { getProjectByCode } = useLocalDB();
  const { projectCode = code } = useParams();

  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (projectCode) {
      const fetchProject = async () => {
        const project = await getProjectByCode(projectCode);
        if (project) {
          setProject(project);
        }
      };

      fetchProject();
    }
  }, [projectCode]);

  // TODO: add some project related actions
  useRegisterActions([], []);

  return { project, projectCode };
};

export default useProject;
