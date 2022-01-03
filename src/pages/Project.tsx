import React, { useMemo } from 'react';
import { useTable, Column, useRowSelect, TableOptions, UseRowSelectOptions } from 'react-table';
import cx from 'classnames';

import type { Card } from 'schemas/card';
import { belerenSmallCaps } from 'styles/fonts.css';
import 'styles/table.scss';

import { cleanManaCost } from 'utils/helpers';
import useProject from 'hooks/useProject';
import useCards from 'hooks/useCards';

const ProjectPage = () => {
  const { project } = useProject();
  const { cards, handleCreateCard } = useCards(project);

  const columns = useMemo<Column<Card>[]>(
    () => [
      { Header: 'Tags', accessor: ({ tag }) => tag },
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

  const tableOptions: TableOptions<Card> & UseRowSelectOptions<Card> = {
    columns,
    data: cards,
    autoResetSelectedRows: false,
  };
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    tableOptions,
    useRowSelect
  );

  return (
    <>
      <button onClick={handleCreateCard}>New card</button>
      <div role="region" aria-labelledby="card-table-label" tabIndex={0}>
        <table {...getTableProps()} className="card-table">
          <caption id="card-table-label" className={cx(belerenSmallCaps)}>
            {project?.name}
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
                      <th key={headerKey} {...headerProps}>
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
                      <td key={cellKey} {...cellProps}>
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
