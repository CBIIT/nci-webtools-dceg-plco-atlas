import React, { useState, useRef, useContext } from 'react';
import {
  SidebarContainer,
  SidebarPanel,
  MainPanel
} from '../../controls/sidebar-container/sidebar-container';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { TreeSelect } from '../../controls/tree-select/tree-select';
import { updateDownloads } from '../../../services/actions';
import { RootContext } from '../../../index';

export function Downloads() {
  const dispatch = useDispatch();
  const { getInitialState } = useContext(RootContext);
  const phenotypes = useSelector(state => state.phenotypes);
  const [messages, setMessages] = useState([]);
  const treeRef = useRef();

  const { selectedPhenotypes, downloadRoot, submitted } = useSelector(
    state => state.downloads
  );

  function handleSubmit(ev) {
    ev.preventDefault();
    setMessages([]);

    if (!selectedPhenotypes.length)
      return setMessages([{type: 'danger', content: 'Please select phenotypes to download.'}]);

    if (selectedPhenotypes.length > 5)
      return setMessages([{type: 'danger', content: 'Please select five or less phenotypes to download.'}]);

    dispatch(
      updateDownloads({
        submitted: true
      })
    );

    selectedPhenotypes.forEach((e, i) => {
      setTimeout(() => {
        download(generateLink(e.name, true));
      }, i * 250);
    });
  }

  function handleReset(ev) {
    ev.preventDefault();
    treeRef.current.resetSearchFilter();
    dispatch(updateDownloads(getInitialState().downloads));
  }

  function handleChange(items) {
    dispatch(
      updateDownloads({
        selectedPhenotypes: items,
        submitted: false
      })
    );
  }

  function generateLink(resource) {
    return `${downloadRoot}${resource}.tsv.gz`;
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

  return (
    <SidebarContainer className="m-3">
      <SidebarPanel className="col-lg-3">
        <form className="px-2 pt-2 pb-3 mb-2 bg-white tab-pane-bordered rounded-0" onSubmit={handleSubmit} onReset={handleReset}>
          <div className="mb-2">
            <b>Phenotypes</b>
            <span style={{ color: 'red' }}>*</span>
            <TreeSelect
              data={phenotypes.tree}
              value={selectedPhenotypes}
              onChange={handleChange}
              ref={treeRef}
              enabled={node => node.import_date}
              visible={(item, {getLeaves}) => item.import_date || getLeaves(item).filter(e => e.import_date).length}
            />
            <small className="text-muted">
              <i>Up to 5 phenotypes may be selected for download. You have currently selected {selectedPhenotypes.length} phenotype(s).</i>
            </small>
          </div>

          {messages.map(({ type, content }, i) => (
            <div 
              key={`download-form-message-${i}`} 
              className={`small my-3 text-${type}`}>
              {content}
            </div>
          ))}

          <div>
            <Button type="submit" variant="silver">Submit</Button>
            <Button type="reset" variant="silver" className="ml-2">Reset</Button>
          </div>
        </form>
      </SidebarPanel>

      <MainPanel className="col-lg-9">
        <div
          className={
            submitted
              ? 'bg-white tab-pane-bordered rounded-0 p-4'
              : 'bg-white tab-pane-bordered rounded-0 p-4 d-flex justify-content-center align-items-center'
          }
          style={{ minHeight: '409px' }}>
          {!submitted && (
            <p className="h4 text-center text-secondary my-5">
              Please select phenotypes to download
            </p>
          )}
          {submitted && (
            <>
              <h2>Downloading Data</h2>
              <p>
                If your downloads do not begin within five seconds, use the
                links below to download data for each selected phenotype.
              </p>

              <ul>
                {selectedPhenotypes.map(e => (
                  <li>
                    <a
                      href={generateLink(e.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download>
                      {e.display_name}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </MainPanel>
    </SidebarContainer>
  );
}
