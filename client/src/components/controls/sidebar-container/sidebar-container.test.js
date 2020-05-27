import React from 'react';
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { SidebarContainer, MainPanel, SidebarPanel } from './sidebar-container';

describe('SidebarContainer Module', function () {
    test('SidebarContainer renders correctly', () => {
        const sidebarText = 'Sidebar';
        const mainText = 'Main';

        render(
            <SidebarContainer>
                <SidebarPanel>{sidebarText}</SidebarPanel>
                <MainPanel>{mainText}</MainPanel>
            </SidebarContainer>
        );

        const sidebarContainer = screen.queryByTestId('SidebarContainer');
        const sidebarPanel = screen.queryByTestId('SidebarPanel');
        const mainPanel = screen.queryByTestId('MainPanel');

        expect(sidebarContainer).toContainElement(sidebarPanel);
        expect(sidebarContainer).toContainElement(mainPanel);
        expect(mainPanel).toHaveTextContent(mainText);
        expect(sidebarPanel).toHaveTextContent(sidebarText);
    });

    test('SidebarContainer renders correctly when collapsed', () => {
        const sidebarText = 'Sidebar';
        const mainText = 'Main';

        render(
            <SidebarContainer collapsed>
                <SidebarPanel>{sidebarText}</SidebarPanel>
                <MainPanel>{mainText}</MainPanel>
            </SidebarContainer>
        );

        const sidebarPanel = screen.queryByTestId('SidebarPanel');
        expect(sidebarPanel).toHaveClass('d-none'); // todo: do not rely on bootstrap styles
    });    
});