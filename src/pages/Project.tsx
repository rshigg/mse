import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTable, Column } from 'react-table';

import { useLocalDB } from 'db/LocalDBContext';
import type { Card } from 'schemas/card';
import type { Project } from 'schemas/project';
import { srOnly } from 'styles/utils.css';
import { table as tableStyles, th, td } from 'styles/table.css';

import { cleanManaCost } from 'utils/helpers';

const ProjectPage = () => {
  const { projectCode = '' } = useParams();
  const db = useLocalDB();
  const { getProjectByCode, getCardsByProjectCode, createCard } = db;

  const [project, setProject] = React.useState<Project | null>(null);
  const [cards, setCards] = React.useState<Card[]>([]);

  const fetchCards = async () => {
    const cards = await getCardsByProjectCode(projectCode);
    setCards(cards);
  };

  useEffect(() => {
    if (projectCode) {
      const fetchProject = async () => {
        const project = await getProjectByCode(projectCode);
        if (project) {
          setProject(project);
          fetchCards();
        }
      };

      fetchProject();
    }
  }, [projectCode]);

  const handleCreateCard = async () => {
    if (project?.code) {
      await createCard(project);
      await fetchCards();
    }
  };

  const columns = useMemo<Column<Card>[]>(
    () => [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Cost', accessor: ({ manaCost }) => cleanManaCost(manaCost) },
      { Header: 'Type', accessor: 'typeLine' },
      {
        Header: 'P/T',
        accessor: ({ power, toughness }) => (power != null ? `${power}/${toughness}` : ''),
      },
      { Header: 'Rarity', accessor: 'rarity' },
    ],
    []
  );

  const tableData = useTable({ columns, data: cards });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableData;

  return (
    <>
      <button onClick={handleCreateCard}>New card</button>
      <div role="region" aria-labelledby="card-table-label" tabIndex={0}>
        <table {...getTableProps()} className={tableStyles}>
          <caption id="card-table-label" className={srOnly}>
            Cards
          </caption>
          <thead>
            {headerGroups.map((headerGroup) => {
              const { key: headerGroupKey, ...headerGroupProps } =
                headerGroup.getHeaderGroupProps();
              return (
                <tr key={headerGroupKey} {...headerGroupProps}>
                  {headerGroup.headers.map((column) => {
                    const { key: headerKey, ...headerProps } = column.getHeaderProps();
                    return (
                      <th key={headerKey} {...headerProps} className={th}>
                        {column.render('Header')}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              const { key: rowKey, ...rowProps } = row.getRowProps();
              return (
                <tr key={rowKey} {...rowProps}>
                  {row.cells.map((cell) => {
                    const { key: cellKey, ...cellProps } = cell.getCellProps();
                    return (
                      <td key={cellKey} {...cellProps} className={td}>
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ProjectPage;
