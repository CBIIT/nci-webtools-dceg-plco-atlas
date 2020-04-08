import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, OverlayTrigger, Popover, Spinner } from 'react-bootstrap';
import { LoadingOverlay } from './loading-overlay';
import { generateShareLink } from '../../services/actions';


export const ShareLink = props => {
  const dispatch = useDispatch();

  const [displayCopied, setDisplayedCopied] = useState(false);

  const copyToClipboard = () => {
    setDisplayedCopied(true);
    var copyText = document.getElementById("share-link-input");
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");
    copyText.setSelectionRange(99999, 99999);
    setTimeout(function() {
      setDisplayedCopied(false);
    }, 1000);
  }

  const shareLink = () => {
    // console.log("do something!", props);
    dispatch(generateShareLink({
      route: window.location.hash.replace('#', ''),
      parameters: props
    }));
  }

  const sharePopover = () => {
    return (
      <Popover id="share-link-popover">
        <LoadingOverlay active={displayCopied} content={"Copied!"}/>
        <Popover.Content>
          <div 
            className="text-center"
            style={{
              display: !props.shareID ? 'block' : 'none',
              width: '250px'
            }}>
            <Spinner animation="border" variant="primary" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
          <div 
            style={{
              display: !props.shareID ? 'none' : 'block'
            }}>
            <div 
              className="input-group my-1" 
              style={{ 
                width: '100%',
                width: '250px' 
              }} >
              <input
                id="share-link-input"
                className="form-control py-1 h-100 border-right-0"
                title="Share link"
                aria-label="Share link"
                // value={window.location.href}
                value={
                  props.shareID 
                  ? window.location.origin + '/#/link/' + props.shareID 
                  : window.location.href}
                type="text"
                // disabled={!data}
                onChange={_ => _}
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
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      rootClose
      shouldUpdatePosition
      overlay={sharePopover()}
      transition={false}>
    <div>
      <Button 
        variant="silver"
        size="sm"
        onClick={e => {
          e.preventDefault();
          shareLink();
        }}
        disabled={props.disabled}>
        Share Link <i className="fa fa-caret-down"></i>
      </Button>
    </div>
  </OverlayTrigger>    
  );
}
