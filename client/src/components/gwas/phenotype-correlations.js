import React, { useState } from 'react';
import { useSelector, useDispatch} from 'react-redux';
import { updatePhenotypeCorrelations } from '../../services/actions';
import { SearchFormTraits } from '../forms/search-form-traits';
import { Heatmap } from '../plots/heatmap-plot';

export function PhenotypeCorrelations() {
    const dispatch = useDispatch();
    const phenotypeCorrelations = useSelector(state => state.phenotypeCorrelations);
    const {
        submitted,
        messages,
        drawHeatmap
    } = phenotypeCorrelations;

    const setSubmitted = submitted => {
        dispatch(updatePhenotypeCorrelations({submitted}));
    }

    // registers a function we can use to draw the qq plot
    const setDrawHeatmap = drawHeatmap => {
        dispatch(updatePhenotypeCorrelations({drawHeatmap}));
    }

    const setMessages = messages => {
        dispatch(updatePhenotypeCorrelations({messages}));
      }
    
    const clearMessages = e => {
    setMessages([]);
    }

    const handleChange = () => {
    clearMessages();
    setSubmitted(null);
    }

    const handleSubmit = params => {
        setSubmitted(new Date());
        // setSelectedChromosome(null);
        console.log(params);
    
        if (!params || !params.value) {
          setMessages([{
            type: 'danger',
            content: 'The selected phenotype has no data.'
          }]);
          return;
        }
    
        if (drawHeatmap)
            drawHeatmap(params.value);
    
    }

    return (
        <>
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <SearchFormTraits onSubmit={handleSubmit} onChange={handleChange} />
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-white font-weight-bolder border-bottom-0">
                    selected phenotypes
                </div>

                <div className="card-body">
                    <p>
                        Placeholder for heatmap of specified phenotypes
                    </p>
                    <div className="row mt-3">
                        <div class="col-md-12 text-left">
                            <pre>{JSON.stringify(phenotypeCorrelations, null, 2)}</pre>
                        </div>
                        <Heatmap
                            drawFunctionRef={setDrawHeatmap}
                        />
                    </div>

                </div>
            </div>
        </>
    );
}
