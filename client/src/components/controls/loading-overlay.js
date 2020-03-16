import React, { useRef, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { useNonStaticParent } from './hooks';

const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    opacity: '0.8',
};

const loaderStyle = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    textAlign: 'center',
};

const DefaultLoader = props => (
    <div style={{...loaderStyle, ...props.loaderStyle}} {...props.loaderProps}>
        <Spinner animation="border" variant="primary" role="status"></Spinner>
        <div>{props.children || <span className="sr-only">Loading</span>}</div>
    </div>
);

export const LoadingOverlay = props => {
    const node = useRef(null);
    useNonStaticParent(node);
    return props.active && <div ref={node} style={{...overlayStyle, ...props.overlayStyle}} {...props.overlayProps}>
        {(props.loader || DefaultLoader)(props)}
    </div>
};
