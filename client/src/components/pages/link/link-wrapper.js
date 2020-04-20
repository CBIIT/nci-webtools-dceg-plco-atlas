import React, { useState, useEffect } from 'react';
import { query } from '../../../services/query';
import { useDispatch } from 'react-redux';
import { 
    updateSummaryResults,
    updateVariantLookup,
    updatePhenotypeCorrelations,
    updateBrowsePhenotypes
} from '../../../services/actions';
 import { Alert, Spinner } from 'react-bootstrap';


export function LinkWrapper(props) {
    const dispatch = useDispatch();

    const { shareID } = props.match.params;

    const [errorMessage, setErrorMessage] = useState(null);

    const [timerSeconds, setTimerSeconds] = useState(5);

    // redirect to home page in _ seconds
    const countdownRedirect = () => {
        if (timerSeconds > 0) {
            setTimeout(function() {
                setTimerSeconds(timerSeconds  - 1);
            }, 1000);
        } else {
            window.location.hash = '/';
        }
    }

    // see if link reference ID is missing or not
    // if missing, display error
    useEffect(() => {
        if (shareID && shareID.length > 0) {
            getShareParams(shareID);
        } else {
            setErrorMessage('Missing share link.');
            countdownRedirect();
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
            setErrorMessage('Invalid or expired share link.');
            countdownRedirect();
        }
    }

    const placeholder = (
        <div style={{ display: 'block' }}>
            
            <div className="h4 text-center">
                <Spinner animation="border" variant="primary" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>
            </div>
            {
                !errorMessage && 
                <p className="h4 text-center text-secondary">
                    Redirecting...
                </p>
            }
            {
                errorMessage && 
                <p className="h4 text-center text-secondary">
                    Redirecting to home page in {timerSeconds} seconds...
                </p>
            }
        </div>
    );

    return (
        <>  
            {errorMessage &&
                <Alert className="container" variant={'danger'}>
                    {errorMessage}
                </Alert>
            }
            <div className="mt-3 container bg-white border rounded-0 p-4 justify-content-center align-items-center">
                {placeholder}
            </div>
        </>
    );
}
