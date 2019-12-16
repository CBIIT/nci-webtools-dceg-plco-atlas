import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import {
  SidebarContainer,
  SidebarPanel,
  MainPanel,
} from '../controls/sidebar-container';

export function Downloads() {

  const [openSidebar, setOpenSidebar] = useState(true);

  return (

    <SidebarContainer collapsed={!openSidebar} onCollapse={e => setOpenSidebar(false)}>
      <SidebarPanel>
        Sidebar
      </SidebarPanel>

      <MainPanel>
        Main
      </MainPanel>
    </SidebarContainer>
  );
}
