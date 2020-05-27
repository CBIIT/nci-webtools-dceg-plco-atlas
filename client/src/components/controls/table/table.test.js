import React from 'react';
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Table } from './Table';

describe('Table Module', function () {
    test('Table renders correctly', () => {
        const keyField = 'a';
        const columns = [
            {dataField: 'a', text: 'a'},
            {dataField: 'b', text: 'b'},
            {dataField: 'c', text: 'c'},
        ];
        const data = [
            {a: 1, b: 2, c: 3},
            {a: 4, b: 5, c: 6},
        ];
        render(<Table keyField={keyField} columns={columns} data={data} />);

        // validate headers
        const headers = screen.queryAllByRole('th');
        headers.forEach((header, index) => {
            expect(header).toHaveTextContent(columns[index].text);
        });

        // validate data
        const rows = screen.queryAllByRole('tr');
        rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, cellIndex) => {
                const key = columns[cellIndex].dataField;
                const expectedValue = data[rowIndex][key];
                expect(cell).toHaveTextContent(expectedValue);
            });
        });
    });
});