import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { PhenotypesForm } from '../forms/phenotypes-form';
import { PhenotypesTabs } from '../phenotypes/phenotypes-tabs';
import { PhenotypesSearchCriteria } from '../controls/phenotypes-search-criteria';
import {
  SidebarContainer,
  SidebarPanel,
  MainPanel,
} from '../controls/sidebar-container';
import { updateBrowsePhenotypes } from '../../services/actions';
import { BubbleChartContainer } from '../plots/bubble-chart';
import BubbleChart from '../../services/plots/bubble-chart';

export function Phenotypes() {
  const dispatch = useDispatch();
  const {
    selectedPhenotype,
    messages,
    submitted
  } = useSelector(state => state.browsePhenotypes);

  const phenotypes = useSelector(state => state.phenotypes);
  const phenotypeCategories = useSelector(state => state.phenotypeCategories);
  const phenotypesTree = useSelector(state => state.phenotypesTree);
  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  const [openSidebar, setOpenSidebar] = useState(true);

  const setMessages = messages => {
    dispatch(updateBrowsePhenotypes({ messages }));
  };

  const setSearchCriteriaPhenotypes = searchCriteriaPhenotypes => {
    dispatch(updateBrowsePhenotypes({ searchCriteriaPhenotypes }));
  };

  const clearMessages = e => {
    setMessages([]);
  };

  // function handleChange(items) {
  //   dispatch(updateBrowsePhenotypes({
  //     selectedPhenotypes: items,
  //     submitted: false,
  //   }));
  // }

  // when submitting:
  // 1. Fetch aggregate data for displaying manhattan plot(s)
  // 2. Fetch variant data for each selected gender
  const handleSubmit = (phenotype) => {
    if (!phenotype) {
      return setMessages([
        {
          type: 'danger',
          content: 'Please select a phenotype.'
        }
      ]);
    }

    // update browse phenotypes filters
    dispatch(
      updateBrowsePhenotypes({
        selectedPhenotype: phenotype,
        submitted: true,
      })
    );

    // some action here

    setSearchCriteriaPhenotypes({
      phenotype: [...phenotype.title]
    });
  };

  const handleReset = params => {
    dispatch(updateBrowsePhenotypes({
      selectedPhenotype: null,
      messages: [],
      submitted: null,
      searchCriteriaPhenotypes: {},
      selectedPlot: 'frequency',
      phenotypeType: 'binary'
    }));
  }

  return (
    <SidebarContainer 
      className="m-3"
      collapsed={!openSidebar}
      onCollapsed={collapsed => setOpenSidebar(!collapsed)}>
      <SidebarPanel className="col-lg-3">
        <div className="p-2 bg-white border rounded-0">
          <PhenotypesForm
            phenotype={selectedPhenotype}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
          {messages &&
            messages.map(({ type, content }) => (
              <Alert className="mt-3" variant={type} onClose={clearMessages} dismissible>
                {content}
              </Alert>
          ))}
        </div>
      </SidebarPanel>

      <MainPanel className="col-lg-9">
        <PhenotypesSearchCriteria />
        {!submitted && 
          <div className="bg-white border rounded-0 p-4 text-center">
            <BubbleChartContainer 
              data={phenotypesTree}
              dataAlphabetical={alphabetizedPhenotypes}
              dataCategories={phenotypeCategories}
              onSubmit={handleSubmit}
            />
            <BubbleChart />
          </div>
        }
        {
          submitted &&
          <PhenotypesTabs />
        }
      </MainPanel>
    </SidebarContainer>
  );
}
