import React, { useState, useEffect } from 'react';
import { query } from '../../services/query';
import { useDispatch } from 'react-redux';
import { 
    updateSummaryResults,
    updateVariantLookup,
    updatePhenotypeCorrelations,
    updateBrowsePhenotypes
 } from '../../services/actions';


export function ShareWrapper(props) {
    const dispatch = useDispatch();

    const { shareID } = props.match.params;

    const [errorMessage, setErrorMessage] = useState(null);

    // see if link reference ID is missing or not
    // if missing, display error
    useEffect(() => {
        if (shareID && shareID.length > 0) {
            getShareParams(shareID);
        } else {
            setErrorMessage('Missing reference ID.');
        }
    });
    
    // retrieved shared parameters by share ID reference in link
    // if share ID is not found in db, display error message
    const getShareParams = async (shareID) => {
        const response = await query('share-link', {share_id:shareID});
        if (response && response.route) {
            setErrorMessage(null);
            const updateStore = {
                "/gwas/summary": updateSummaryResults,
                "/gwas/lookup": updateVariantLookup,
                "/gwas/correlations": updatePhenotypeCorrelations,
                "/phenotypes": updateBrowsePhenotypes
            }[response.route];
            dispatch(updateStore({sharedState: response}));
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
