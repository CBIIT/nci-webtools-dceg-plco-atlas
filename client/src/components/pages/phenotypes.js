import React, { useState, useRef, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Breadcrumb } from 'react-bootstrap';
import { PhenotypesForm } from '../forms/phenotypes-form';
import { PhenotypesTabs } from '../phenotypes/phenotypes-tabs';
import { PhenotypesSearchCriteria } from '../controls/phenotypes-search-criteria';
import {
  SidebarContainer,
  SidebarPanel,
  MainPanel,
} from '../controls/sidebar-container';
import { updateBrowsePhenotypes } from '../../services/actions';
import { query } from '../../services/query';
import { BubbleChart as Plot } from '../../services/plots/bubble-chart';
import { Icon } from '../controls/icon';

export function Phenotypes() {
  const dispatch = useDispatch();
  const {
    selectedPhenotype,
    messages,
    submitted,
    breadcrumb,
    currentBubbleData,
    data,
  } = useSelector(state => state.browsePhenotypes);

  const plotContainer = useRef(null);
  // const plot = useRef(null);

  const phenotypesTree = useSelector(state => state.phenotypesTree);

  const [openSidebar, setOpenSidebar] = useState(true);

  const setMessages = messages => {
    dispatch(updateBrowsePhenotypes({ messages }));
  };

  const setSearchCriteriaPhenotypes = searchCriteriaPhenotypes => {
    dispatch(updateBrowsePhenotypes({ searchCriteriaPhenotypes }));
  };

  const setBreadcrumb = breadcrumb => {
    dispatch(updateBrowsePhenotypes({ breadcrumb}));
  };

  const setCurrentBubbleData = currentBubbleData => {
    dispatch(updateBrowsePhenotypes({
      currentBubbleData,
      selectedPhenotype: null
    }))
  };

  const setSelectedPhenotype = selectedPhenotype => {
    dispatch(updateBrowsePhenotypes({ selectedPhenotype }));
  }

  const clearMessages = e => {
    setMessages([]);
  };

  function handleChange(phenotype) {
    setSelectedPhenotype(phenotype);
  }

  // when submitting:
  // 1. Fetch aggregate data for displaying manhattan plot(s)
  // 2. Fetch variant data for each selected gender
  const handleSubmit = async (phenotype) => {
    if (!phenotype) {
      return setMessages([
        {
          type: 'danger',
          content: 'Please select a phenotype.'
        }
      ]);
    }

    // some action here
    const data = await query('data/phenotype_data_binary.json');

    // update browse phenotypes filters
    dispatch(
      updateBrowsePhenotypes({
        selectedPhenotype: phenotype,
        submitted: true,
        phenotypeData: data,
      })
    );

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
      phenotypeType: 'binary',
      breadcrumb: [],
      currentBubbleData: null,
      phenotypeData: null,
    }));
  }

  useEffect(() => {
    console.log("useEffect() triggered!");
    if (submitted || !phenotypesTree) return;
    plotContainer.current.innerHTML = '';
    drawBubbleChart(currentBubbleData ? currentBubbleData : phenotypesTree);
  }, [phenotypesTree, breadcrumb, currentBubbleData, selectedPhenotype])

  const drawBubbleChart = (data) => {
    new Plot(plotContainer.current, data, handleSingleClick, handleDoubleClick, handleBackgroundDoubleClick, selectedPhenotype);
  }

  const handleSingleClick = (e) => {
    if (e) {
      if (e.data.children && e.data.children.length > 0) {
        // parent
        setSelectedPhenotype(null);
      } else {
        //leaf
        // console.log("LEAF!", e.data);
        setSelectedPhenotype(e.data);
      }
    } else {
      // background is clicked
      setSelectedPhenotype(null);
    }
  }

  const handleDoubleClick = (e) => {
    if (e.data.children && e.data.children.length > 0) {
      // parent
      setCurrentBubbleData(e.data.children);
      setBreadcrumb([...breadcrumb, e]);
    } else {
      // leaf
      handleSubmit(e.data);
    }
  }

  const handleBackgroundDoubleClick = () => {
    if (breadcrumb.length >= 1) {
      setCurrentBubbleData(breadcrumb[breadcrumb.length - 1].parent.data.children);
      setBreadcrumb([...breadcrumb.splice(0, breadcrumb.length -  1)]);
    }
  }

  const crumbClick = (item, idx) => {
    let newBreadcrumb = breadcrumb.splice(0, idx);
    setBreadcrumb(newBreadcrumb);
    setCurrentBubbleData(item.parent.data.children);
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
            onChange={handleChange}
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
          <div className="bg-white border rounded-0 p-4">
            {
              breadcrumb.length > 0 && breadcrumb.map((item, idx) =>
                <span className="" key={"crumb-" + item.data.title}>
                  <a
                    href="javascript:void(0)"
                    onClick={_ => crumbClick(item, idx)}
                  >
                    { idx === 0 ? 'All Phenotypes' : item.data.title}
                  </a>
                  <Icon
                    name="arrow-left"
                    className="mx-2 opacity-50"
                    width="10"
                  />
                </span>
              )
            }
            {
              breadcrumb.length === 0 &&
              <br />
            }
            <div
              ref={plotContainer}
              className="mt-3 bubble-chart text-center"
            />
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
