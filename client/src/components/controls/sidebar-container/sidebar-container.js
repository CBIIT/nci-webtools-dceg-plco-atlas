
import React, { useEffect, useState } from 'react';

export const SidebarPanel = ({children}) => <>{children}</>
export const MainPanel = ({children}) => <>{children}</>
export const CollapseButton = ({collapsed, toggleCollapse}) => (
    <button
        onClick={toggleCollapse}
        style={{
            position: 'absolute',
            left: '-10px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'rgb(0, 126, 167)',
        }}>
        <span className="sr-only">Show or hide input sidebar</span>
        <i className={`
            fa fa-lg
            fa-caret-${collapsed ? 'right' : 'left'}
        `} />
    </button>
);

export function SidebarContainer({
    collapsed = false,
    onCollapsed = () => {},
    children = [],
    className = '',
    collapseButton = CollapseButton
}) {
    // find children for sidebar and main panel
    let sidebarPanel = children.find(c => c.type === SidebarPanel);
    let mainPanel = children.find(c => c.type === MainPanel);

    // determine css classes for panel containers
    let sidebarPanelClass = sidebarPanel.props.className || 'col-md-3';
    let mainPanelClass = mainPanel.props.className || 'col-md-9';

    // assign collapsed prop to internal _collapsed state
    let [_collapsed, _setCollapsed] = useState(collapsed || false);
    useEffect(() => _setCollapsed(collapsed), [collapsed]);

    // notify callback when collapsed
    function toggleCollapse() {
        let collapsed = !_collapsed;
        _setCollapsed(collapsed);
        onCollapsed(collapsed);
    }

    return (
        <div data-testid="SidebarContainer" className={`row ${className}`}>
            <div data-testid="SidebarPanel" className={_collapsed ? 'd-none' : sidebarPanelClass}>
                {sidebarPanel}
            </div>

            <div data-testid="MainPanel" className={`
                position-relative
                ${_collapsed ? 'col-md' : mainPanelClass}
            `}>
                {collapseButton({
                    collapsed: _collapsed,
                    toggleCollapse: toggleCollapse,
                })}
                {mainPanel}
            </div>
        </div>
    );
}
