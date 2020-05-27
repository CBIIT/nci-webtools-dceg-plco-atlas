import React, {useState, useEffect} from 'react';

export const Tooltip = props => {
    // link state to props (to use as a controlled component)
    const [visible, setVisible] = useState(false);
    useEffect(() => setVisible(props.visible), [props.visible]);

    const style = {
        position: 'absolute',
        left: `${props.x || 0}px`,
        top: `${props.y || 0}px`,
        display: visible ? 'inline-block' : 'none',
        borderRadius: '0.25rem',
        padding: '0.5rem 1rem',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.05s',
        backgroundColor: 'white',
        zIndex: 9999,
        opacity: 0.9,
        ...props.style
    };

    const closeButtonStyle = {
        border: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        margin: '5px',
        position: 'absolute',
        top: 0,
        right: 0,
        cursor: 'pointer',
    };
    
    return <div data-testid="Tooltip" style={style} className={props.className}>
        {props.closeButton && <button 
            data-testid="TooltipCloseButton"
            style={closeButtonStyle} 
            onClick={e => {
                setVisible(false);
                if (props.onClose)
                    props.onClose()
            }}>
            &times;
        </button>}
        {props.children}
    </div>;
}