import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { query } from '../../services/query';
// import { Home } from '../pages/home';
// import { SummaryResults } from '../gwas/summary-results';
// import { VariantLookup } from '../gwas/variant-lookup';
// import { PhenotypeCorrelations } from '../gwas/phenotype-correlations';
// import { Phenotypes } from '../pages/phenotypes';


export function ShareWrapper(props) {
    const { shareID } = props.match.params;

    const [shareParams, setShareParams] = useState(null);

    useEffect(() => {
        try {
            getShareParams(shareID);
        } catch(err) {
           // error handling
        }
    });
     
    const getShareParams = async (shareID) => {
        // const { shareID } = props.match.params;
        console.log("shareID", shareID)
        const response = await query('share-link', {share_id:shareID});
        console.log("response", response);
        setShareParams(response);
    }

    const Reroute = () => {
        console.log("reroute!", shareParams);

        return (
            <Redirect
                to={{
                    pathname: shareParams.route,
                    state: shareParams.parameters
                }}
            />
        );
    }

    return (
        <>
            {
                !shareParams && (
                    <div className="mt-3 container bg-white border rounded-0 p-4">
                        {shareID}
                    </div>
                )
            }
            {
                shareParams && (
                    <Reroute />
                )
            }
        </>
    );
}
