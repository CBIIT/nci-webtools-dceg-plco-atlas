import React, { useState, useRef } from 'react';
import {
  SidebarContainer,
  SidebarPanel,
  MainPanel,
} from '../controls/sidebar-container';
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { TreeSelect } from '../controls/tree-select';
import { updateDownloads } from '../../services/actions';

export function Downloads() {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);

  const {
    selectedPhenotypes,
    downloadRoot,
    submitted
  } = useSelector(state => state.downloads);

  function handleSubmit() {
    if (!selectedPhenotypes.length || selectedPhenotypes.length > 5) {
      return;
    }

    dispatch(updateDownloads({
      submitted: true
    }));

    selectedPhenotypes.forEach((e, i) => {
      setTimeout(() => {
        download(generateLink(e.value, true));
      }, i * 250);
    })
  }

  function handleReset() {
    dispatch(updateDownloads({
      selectedPhenotypes: [],
      submitted: false,
    }));
  }

  function handleChange(items) {
    dispatch(updateDownloads({
      selectedPhenotypes: items,//.slice(0, 5),
      submitted: false,
    }));
  }

  function generateLink(resource) {
    return `${downloadRoot}${resource}.txt`;
  }

  function download(url, newWindow) {
    let a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop();
    if (newWindow) a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const treeRef = useRef();

  return (
    <SidebarContainer className="m-3">
      <SidebarPanel className="col-lg-3">
        <div className="px-2 pt-2 pb-3 bg-white border rounded-0">
          <div className="mb-2">
            <b>Phenotypes</b>
            <span style={{ color: 'red' }}>*</span>
            <TreeSelect
              data={phenotypes}
              value={selectedPhenotypes}
              onChange={handleChange}
              ref={treeRef}
            />
            <small className="text-muted"><i>Up to five phenotypes may be selected for download.</i></small>
          </div>

          <div>
            <Button
              variant="silver"
              onClick={handleSubmit}
              disabled={!selectedPhenotypes.length || selectedPhenotypes.length > 5}
              title={
                selectedPhenotypes.length == 0
                  ? 'Please select phenotype(s) to download.'
                  : selectedPhenotypes.length > 5
                  ? 'A maximum of five phenotypes may be selected to download.'
                  : ''}>
              Download
            </Button>
            <Button
              className="ml-2"
              variant="silver"
              onClick={e => {
                e.preventDefault();
                handleReset();
                treeRef.current.resetSearchFilter();
              }}>
              Reset
            </Button>
          </div>
        </div>
      </SidebarPanel>

      <MainPanel className="col-lg-9">
        <div 
          className={
            submitted ?
            "bg-white border rounded-0 p-4" :
            "bg-white border rounded-0 p-4 d-flex justify-content-center align-items-center"
          }
          style={{ minHeight: '409px' }}>
          {!submitted && <p className="h4 text-center text-secondary my-5">Please select phenotypes to download</p>}
          {submitted && <>
            <h2>Downloading Data</h2>
            <p>If your downloads do not begin within five seconds, use the links below to download data for each selected phenotype.</p>

            <ul>
              {selectedPhenotypes.map(e => (
                <li><a href={generateLink(e.value)} target="_blank" download>
                  {e.title}
                </a></li>
              ))}
            </ul>
          </>}
        </div>
      </MainPanel>
    </SidebarContainer>
  );
}
