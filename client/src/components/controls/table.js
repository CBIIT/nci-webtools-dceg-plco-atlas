import React, { useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next'
import { Icon } from './icon';

export const defaultProps = {
    bootstrap4: true,
    bordered: false,
    hover: true,
    striped: true,
    condensed: true,
    className: 'table-borderless',
    noDataIndication: () => <div>No data is available</div>
}

export const paginationText = (from, to, size) => {
    return size > 0 ? (
        <span className="react-bootstrap-table-pagination-total ml-2">
            Showing&nbsp;
            { (1 + to - from) < size && `${from} to ${to} of `}
            { size.toLocaleString() }
            { size === 1 ? ' variant' : ' variants'}
        </span>
    ) : null;
}

export const Table = props => {
    props.columns.forEach(c => {
        if (c.sort) {
            let sortIcon = order => {
                switch(order) {
                    case 'asc':
                        return 'sort-up';
                    case 'desc':
                        return 'sort-down';
                    default:
                        return 'sort';
                }
            }

            c.sortCaret = order => (
                <Icon
                    name={sortIcon(order)}
                    alt="sort-icon"
                    width="10"
                    height="16"
                    className="ml-1" />
            );
        }
    });

    return <BootstrapTable
        {...defaultProps}
        {...props}
    />
}