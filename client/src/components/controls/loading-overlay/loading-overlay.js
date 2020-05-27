import React, { useRef, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { useNonStaticParent, useAbsoluteCenteredPositioning } from '../hooks';

const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    opacity: '0.8',
    zIndex: 9999,
};

const loaderStyle = {
    textAlign: 'center',
};

const DefaultLoader = props => (
    <div style={{...loaderStyle, ...props.loaderStyle}} {...props.loaderProps} data-testid="DefaultLoader">
        {props.children || props.content || <>
            <Spinner animation="border" variant="primary" role="status"></Spinner>
            <div className="sr-only">Loading...</div>
        </>}
    </div>
);

/**
 * Example Usage: <LoadingOverlay active={loading}>Loading</LoadingOverlay>
 * @param {*} props
 */
export const LoadingOverlay = props => {
    const overlayNode = useRef(null);
    const loaderNode = useRef(null);
    useNonStaticParent(overlayNode);
    useAbsoluteCenteredPositioning(loaderNode);
    return props.active && <div data-testid="LoadingOverlay" ref={overlayNode} style={{...overlayStyle, ...props.overlayStyle}} {...props.overlayProps}>
        <div style={{visibility: 'hidden'}} ref={loaderNode}>{(props.loader || DefaultLoader)(props)}</div>
    </div>
};
