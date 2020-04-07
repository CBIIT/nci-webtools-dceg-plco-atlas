import React, { useState, useEffect } from 'react';
import { query } from '../../services/query';
import { useDispatch } from 'react-redux';
import { updateSharedState } from '../../services/actions';


export function ShareWrapper(props) {
    const dispatch = useDispatch();

    const { shareID } = props.match.params;

    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (shareID && shareID.length > 0) {
            getShareParams(shareID);
        } else {
            setErrorMessage('Missing reference ID.');
        }
    });
     
    const getShareParams = async (shareID) => {
        // const { shareID } = props.match.params;
        console.log("shareID", shareID)
        const response = await query('share-link', {share_id:shareID});
        console.log("response", response);
        if (response && response.route) {
            setErrorMessage(null);
            dispatch(updateSharedState(response));
            window.location.hash = response.route;
        } else {
            setErrorMessage('Invalid or expired reference ID.');
        }
    }

    return (
        <div className="mt-3 container bg-white border rounded-0 p-4">
            {errorMessage}
        </div>
    );
}
