import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';

import Card from 'components/Card';
import { useLocalDB } from 'db/LocalDBContext';
import { Project, ProjectDefaultValues, projectDefaultValues } from 'schemas/project';

const Home = () => {
  const { getAllSets, createSet, createCard, getAllCards } = useLocalDB();

  const [cardSets, setCardSets] = useState<Project[]>([]);

  const getSets = async () => {
    const sets = await getAllSets();
    setCardSets(sets);
  };

  useEffect(() => {
    getSets();
  }, []);

  const handleSubmit = async (values: ProjectDefaultValues) => {
    await createSet(values);
    await getSets();
  };

  const createNewCard = async () => {
    const [project] = await getAllSets();
    if (project) {
      await createCard(project);
      console.table(await getAllCards());
    }
  };

  return (
    <>
      <Card />
      <Formik initialValues={projectDefaultValues} onSubmit={handleSubmit}>
        <Form>
          <label>
            Name
            <Field name="name" autoComplete="off" />
          </label>
          <label>
            Code
            <Field name="code" autoComplete="off" />
          </label>
          <button type="submit">Create set</button>
        </Form>
      </Formik>
      <button onClick={async () => console.log(await getAllSets())}>Get sets</button>
      <br />
      <button onClick={createNewCard}>Add card</button>
      <hr />
      {cardSets.map(({ projectId, name, code }) => (
        <div key={projectId}>
          {name}
          <br />
          {code}
        </div>
      ))}
    </>
  );
};

export default Home;
