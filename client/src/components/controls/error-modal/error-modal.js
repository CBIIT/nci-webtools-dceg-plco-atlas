import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { updateError } from '../../../services/actions';

export function ErrorModal(props) {
    const error = useSelector(store => store.error);
    const dispatch = useDispatch();
    const closeErrorModal = () => dispatch(updateError({visible: false}));

    return (
        <Modal data-testid="ErrorModal" show={error.visible} onHide={closeErrorModal}>
            <Modal.Header closeButton>
                <Modal.Title>Error</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p 
                    data-testid="ErrorModalMessage" 
                    dangerouslySetInnerHTML={{__html: error.message}} />
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={closeErrorModal}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}