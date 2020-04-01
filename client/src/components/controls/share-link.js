import React, { forwardRef, useState, useEffect, useImperativeHandle } from 'react';
import { Button, OverlayTrigger, Popover, Spinner } from 'react-bootstrap';
import { LoadingOverlay } from './loading-overlay';

export const ShareLink = forwardRef(({
    // submitted
  }, ref) => {

  useImperativeHandle(ref, () => ({
    // resetSearchFilter() {
    //   clearSearchFilter();
    //   collapseAllParents();
    // },
    // expandSelectedPhenotype(displayTreeParent) {
    //   collapseAllParents();
    //   expandParents(displayTreeParent)
    // }
  }));

  const [loading, setLoading] = useState(true);

  const [displayCopied, setDisplayedCopied] = useState(false);

  const copyToClipboard = () => {
    setDisplayedCopied(true);
    var copyText = document.getElementById("share-link-input");
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");
    setTimeout(function() {
      setDisplayedCopied(false);
    }, 1000);
  }

  const shareLink = () => {
    console.log("do something!");
    setTimeout(function() {
      setLoading(false);
    }, 1000);
  }

  const sharePopover = () => {
    return (
      <Popover id="share-link-popover">
        <LoadingOverlay active={displayCopied} content={"Copied!"}/>
        <Popover.Title as="h3">Copy this URL</Popover.Title>
        <Popover.Content>
          <div 
            className="text-center"
            style={{
              display: loading ? 'block' : 'none',
              width: '250px'
            }}>
            <Spinner animation="border" variant="primary" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
          <div 
            style={{
              display: loading ? 'none' : 'block'
            }}>
            <div 
              className="input-group" 
              style={{ 
                width: '100%',
                width: '250px' 
              }} >
              <input
                id="share-link-input"
                className="form-control py-1 h-100 border-right-0"
                title="Share link"
                // placeholder="Search Phenotype"
                aria-label="Share link"
                value={window.location.href}
                type="text"
                // disabled={!data}
              />
              <div className="input-group-append">
                <button
                  className="input-group-text"
                  title="Copy link to clipboard"
                  onClick={e => {
                    copyToClipboard();
                  }}>
                  <i className="fa fa-paste" style={{fontSize: '14px'}}></i>
                </button>
              </div>
            </div>
          </div>
        </Popover.Content>
      </Popover>
    );
  }

  return (
    <div style={{position: 'relative'}}>
      <OverlayTrigger
        trigger="click"
        placement="bottom"
        rootClose
        shouldUpdatePosition
        overlay={sharePopover()}>
      <div>
        <Button 
          variant="silver"
          size="sm"
          onClick={e => {
            e.preventDefault();
            shareLink();
          }}>
          Share <i className="fa fa-caret-down"></i>
        </Button>
      </div>
    </OverlayTrigger>
    </div>
    
  );
});
