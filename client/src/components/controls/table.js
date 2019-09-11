import React, { useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next'

export const defaultProps = {
    bootstrap4: true,
    bordered: false,
    hover: true,
    striped: true,
    condensed: true,
}

export const Table = props => {
    props.columns.forEach(c => {
        if (c.sort) {
            c.sortCaret = order => <img
                className="ml-1"
                alt="sort-icon"
                width="10"
                height="16"
                src={'assets/icons/' + (
                    order === 'asc' ? 'sort-up.svg' :
                    order === 'desc' ? 'sort-down.svg' :
                    'sort.svg'
            )} />
        }
    });

    return <BootstrapTable
        {...defaultProps}
        {...props}
    />
}