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
  const phenotypeCategories = useSelector(state => state.phenotypeCategories);
  const phenotypesTree = useSelector(state => state.phenotypesTree);

  const {
    selectedPhenotypes,
    downloadRoot,
    submitted
  } = useSelector(state => state.downloads);

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

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
        <div className="p-2 bg-white border rounded-0">
          <div className="mb-2">
            <b>Phenotypes</b>
            <span style={{ color: 'red' }}>*</span>
            <TreeSelect
              data={phenotypesTree}
              dataAlphabetical={alphabetizedPhenotypes}
              dataCategories={phenotypeCategories}
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
        <div className="bg-white border rounded-0 p-4" style={{ minHeight: '50vh' }}>
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
