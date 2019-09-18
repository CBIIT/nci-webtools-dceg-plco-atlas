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
        <span className="react-bootstrap-table-pagination-total ml-2 small text-muted">
            Showing&nbsp;
            { (1 + to - from) < size && `${from} to ${to} of `}
            { size.toLocaleString() }
            { size === 1 ? ' variant' : ' variants'}
        </span>
    ) : null;
}

export const paginationIcons = {
    firstPageText: <Icon name="angle-double-left" alt="first page" width="16" height="10"  />,
    lastPageText: <Icon name="angle-double-right" alt="last page" width="16" height="10"  />,
    prePageText: <Icon name="angle-left" alt="previous page" width="16" height="10"  />,
    nextPageText: <Icon name="angle-right" alt="next page" width="16" height="10"  />,
}

export const paginationButton = ({page, active, disabled, title, onPageChange}) => {
    console.log('paged', {page, active, disabled, title, onPageChange})
    let icons = {
        'first page': <Icon name="angle-double-left" alt="first page" width="16" height="12"  />,
        'last page': <Icon name="angle-double-right" alt="last page" width="16" height="12"  />,
        'next page': <Icon name="angle-right" alt="next page" width="16" height="12"  />,
        'previous page': <Icon name="angle-left" alt="previous page" width="16" height="12"  />,
    }
    let content = icons[title] || <span>{title}</span>;

    return (
        <li className={["page-item", active ? 'active' : ''].join(' ')}
            onClick={e => onPageChange(page)}>
            <a
                className="page-link d-flex align-items-center h-100"
                style={{border: 'none', fontSize: '0.8rem'}}
                href="javascript:void(0)" aria-label={title}>
                {content}
            </a>
        </li>
    );
}

export const paginationSizeSelector = ({options, currSizePerPage, onSizePerPageChange}) => {
    return (
        <select
            className="form-control-sm"
            value={currSizePerPage}
            onChange={e => onSizePerPageChange(e.target.value)}
            aria-label="Select a pagination size">
            {options.map(option =>
                <option
                    key={option.page}
                    value={option.page}>
                    { option.text }
                </option>
            )}
        </select>
    )
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
                    alt="sort icon"
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