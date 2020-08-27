import React, { useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import overlayFactory from 'react-bootstrap-table2-overlay';
import { Icon } from '../icon/icon';
import './table.scss'


export const defaultProps = {
  bootstrap4: true,
  bordered: false,
  hover: true,
  striped: true,
  condensed: true,
  className: 'table-borderless',
  noDataIndication: () => (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '60px' }}>
      No data
    </div>
  )
};

export const paginationText = (singular = 'variant', plural = 'variants') => (from, to, size) => {
  return size > 0 ? (
    <span className="react-bootstrap-table-pagination-total ml-2 small text-muted">
      Showing&nbsp;
      {1 + to - from < size && `${from} to ${to} of `}
      {size.toLocaleString()}
      {size === 1 ? ` ${singular}` : ` ${plural || (singular + 's')}`}
    </span>
  ) : null;
};

export const paginationIcons = {
  firstPageText: (
    <Icon name="angle-double-left" alt="first page" width="16" height="10" />
  ),
  lastPageText: (
    <Icon name="angle-double-right" alt="last page" width="16" height="10" />
  ),
  prePageText: (
    <Icon name="angle-left" alt="previous page" width="16" height="10" />
  ),
  nextPageText: (
    <Icon name="angle-right" alt="next page" width="16" height="10" />
  )
};

export const paginationButton = ({
  page,
  active,
  disabled,
  title,
  onPageChange
}) => {
  let icons = {
    'first page': (
      <Icon name="angle-double-left" alt="first page" width="16" height="12" />
    ),
    'last page': (
      <Icon name="angle-double-right" alt="last page" width="16" height="12" />
    ),
    'next page': (
      <Icon name="angle-right" alt="next page" width="16" height="12" />
    ),
    'previous page': (
      <Icon name="angle-left" alt="previous page" width="16" height="12" />
    )
  };
  let content = icons[title] || <span>{title}</span>;

  return (
    <li
      key={`pagination-list-item-${page}`}
      className={['page-item', active ? 'active' : 'text-muted'].join(' ')}
      onClick={e => onPageChange(page)}>
      <a
        className="page-link d-flex align-items-center h-100"
        style={{ border: 'none', fontSize: '0.8rem' }}
        href="javascript:void(0)"
        aria-label={title}>
        {content}
      </a>
    </li>
  );
};

export const paginationSizeSelector = ({
  options,
  currSizePerPage,
  onSizePerPageChange
}) => {
  return (
    <select
      className="form-control-sm"
      value={currSizePerPage}
      onChange={e => onSizePerPageChange(e.target.value)}
      aria-label="Select a pagination size">
      {options.map(option => (
        <option key={option.page} value={option.page}>
          {option.text}
        </option>
      ))}
    </select>
  );
};

export const overlayConfig = {
  spinner: true,
  styles: {
    spinner: base => ({
      ...base,
      marginTop: '10px',
      width: '40px',
      '& svg circle': {
        stroke: '#888'
      }
    }),
    wrapper: base => ({
      ...base,
      // 'pointer-events': 'none'
    }),
    overlay: base => ({
      ...base,
      background: 'rgba(255, 255, 255, 0.4)'
    })
  }
};

export const plotOverlayConfig = {
  spinner: true,
  styles: {
    ...overlayConfig.styles,
    wrapper: base => ({
      ...base,
      position: 'absolute',
      width: '100%',
      height: '100%'
    })
  }
};

export const loadingOverlay = overlayFactory(overlayConfig);

export const Table = props => {
  props.columns.forEach(c => {
    if (c.sort) {
      let sortIcon = order => {
        switch (order) {
          case 'asc':
            return 'sort-up';
          case 'desc':
            return 'sort-down';
          default:
            return 'sort';
        }
      };

      c.sortCaret = order => (
        <Icon
          name={sortIcon(order)}
          alt="sort icon"
          width="10"
          height="16"
          className="ml-1"
        />
      );
    }
  });

  return <BootstrapTable {...defaultProps} {...props} />;
};
