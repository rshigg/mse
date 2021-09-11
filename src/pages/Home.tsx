import React from 'react';
import { Formik, Form, Field } from 'formik';
import { v4 as uuid } from 'uuid';

import Card from '../components/Card';
import { useWorker } from '../WorkerContext';

interface FormValues {
  name: string;
  code: string;
}

const initialValues: FormValues = {
  name: '',
  code: '',
};

const Home = () => {
  const instance = useWorker();

  const handleSubmit = (values: FormValues) => {
    // worker.postMessage({ type: 'create_set', values: { setId: uuid(), ...values } });
  };

  return (
    <>
      <Card />
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        <Form>
          <label>
            Name
            <Field name="name" />
          </label>
          <label>
            Code
            <Field name="code" />
          </label>
          <button type="submit">Create set</button>
        </Form>
      </Formik>
      <button onClick={async () => console.log(await instance.getAllSets())}>Get sets</button>
    </>
  );
};

export default Home;
