
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
            color: 'rgb(0, 140, 186)',
        }}>
        <i className={`
            fas fa-lg
            fa-caret-${collapsed ? 'right' : 'left'}
        `} />
    </button>
);

export function SidebarContainer({
    collapsed = false,
    onCollapsed = () => {},
    children = [],
    containerClass = '',
    sidebarPanelClass = 'col-md-3',
    mainPanelClass = 'col-md-9',
    collapseButton = CollapseButton
}) {
    // find children for sidebar and main panel
    let sidebarPanel = children.find(c => c.type === SidebarPanel);
    let mainPanel = children.find(c => c.type === MainPanel);

    console.log(sidebarPanel);

    // assign collapsed prop to internal collapsed state
    let [_collapsed, _setCollapsed] = useState(collapsed || false);
    useEffect(() => _setCollapsed(collapsed), [collapsed]);

    // notify callback when collapsed
    function toggleCollapse() {
        let collapsed = !_collapsed;
        _setCollapsed(collapsed);
        onCollapsed(collapsed);
    }

    return (
        <div className={`row ${containerClass}`}>
            <div className={_collapsed ? 'd-none' : sidebarPanelClass}>
                {sidebarPanel}
            </div>

            <div className={`
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
