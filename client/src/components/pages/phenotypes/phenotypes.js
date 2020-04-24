import React, { useState, useRef, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Spinner } from 'react-bootstrap';
import { PhenotypesForm } from './phenotypes-form';
import { PhenotypesTabs } from './phenotypes-tabs';
import { PhenotypesSearchCriteria } from './phenotypes-search-criteria';
import {
  SidebarContainer,
  SidebarPanel,
  MainPanel,
} from '../../controls/sidebar-container';
import { updateBrowsePhenotypes, updateBrowsePhenotypesPlots } from '../../../services/actions';
import { getInitialState } from '../../../services/store';
import { query } from '../../../services/query';
import { BubbleChart as Plot } from '../../plots/custom/bubble-chart/bubble-chart';
import { LoadingOverlay } from '../../controls/loading-overlay';
import { Icon } from '../../controls/icon';

export function Phenotypes() {
  const dispatch = useDispatch();
  const {
    selectedPhenotype,
    messages,
    submitted,
    breadCrumb,
    currentBubbleData,
    categoryColor,
    selectedPlot,
    sharedState
  } = useSelector(state => state.browsePhenotypes);
  const {
    loading
  } = useSelector( state => state.browsePhenotypesPlots);

  const plotContainer = useRef(null);

  const phenotypes = useSelector(state => state.phenotypes);

  const [openSidebar, setOpenSidebar] = useState(true);

  const setMessages = messages => {
    dispatch(updateBrowsePhenotypes({ messages }));
  };

  const setSelectedPhenotype = selectedPhenotype => {
    dispatch(updateBrowsePhenotypes({ selectedPhenotype }));
  };

  const setCategoryColor = categoryColor => {
    dispatch(updateBrowsePhenotypes({ categoryColor}));
  }

  const clearMessages = e => {
    setMessages([]);
  };

  const getParent = (item, node, parent, found = []) => {
    if (item.children && item.children.length > 0) {
      // has children = PARENT
      for (var i = 0; i < item.children.length; i++) {
        getParent(item.children[i], node, item, found)
      }
    }
    else {
      // no children = LEAF
      if (item.id === node.id) {
        found.push(parent);
      }
    }
    return found;
  };


  const getParents = (node, parents = []) => {
    phenotypes && phenotypes.categories.map((item) => {
      item.children.map((child) => {
        if (child.id === node.id) {
          parents.push(item)
          getParents(item, parents);
        }
      })
    });
    return parents;
  }

  const getColor = (node) => {
    var color = null;
    if (node.color) {
      // if node has color already, no need to search for it
      return node.color;
    } else {
      const parents = getParents(node);
      if (parents && parents.length > 0) {
        parents.map((item) => {
          if (item.color) {
            color = item.color
          }
        });
        return color;
      } else {
        return color;
      }
    }
  }

  const handleChange = (phenotype) => {
    const color = getColor(phenotype);
    // setCategoryColor(color);

    let phenotypesTreeFull = {
        children: phenotypes.tree
    };
    const parent = getParent(phenotypesTreeFull, phenotype, null)[0];
    if (parent) {
      dispatch(updateBrowsePhenotypes({
        categoryColor: color,
        currentBubbleData: parent.children,
        breadCrumb: [{
            data: {
              title: parent.title
            },
            parent: {
              data:  {
                children: phenotypes.tree
              }
            }
          }]
      }));
    }
    dispatch(updateBrowsePhenotypes({
      selectedPhenotype: phenotype,
      displayTreeParent: {
        data: phenotype
      }
    }));
  }

  // when submitting:
  // 1. Fetch aggregate data for displaying manhattan plot(s)
  // 2. Fetch variant data for each selected sex
  const handleSubmit = async (phenotype) => {
    if (!phenotype) {
      return setMessages([
        {
          type: 'danger',
          content: 'Please select a phenotype.'
        }
      ]);
    }

    dispatch(
      updateBrowsePhenotypesPlots({
        phenotypeData: null,
        loading: true
      })
    );

    dispatch(
      updateBrowsePhenotypes({
        submitted: false,
      })
    );

    const data = await query('phenotype', {
      id: phenotype.id,
      type: {
        'frequency': 'frequency',
        'distribution': 'distribution',
        'distribution-inverted': 'distributionInverted',
        'related-phenotypes': 'related',
      }[selectedPlot] || 'all'
    });

    dispatch(
      updateBrowsePhenotypesPlots({
        phenotypeData: data,
        loading: false
      })
    )

    // update browse phenotypes filters
    dispatch(
      updateBrowsePhenotypes({
        selectedPhenotype: phenotype,
        submitted: new Date(),
      })
    );
  };

  const loadState = state => {
    if (!state || !Object.keys(state).length) return;
    dispatch(updateBrowsePhenotypes({
      ...state, 
      submitted: false,
      sharedState: null
    }));
    if (state.submitted) {
      handleSubmit(state.selectedPhenotype);
    } 
  }

  useEffect(() => {
    if (sharedState && sharedState.parameters && sharedState.parameters.params) {
      loadState(sharedState.parameters.params);
    }
  }, [sharedState]);

  useEffect(() => {
    // if (sharedState) return;
    if (selectedPhenotype) {
      setSelectedPhenotype(selectedPhenotype);
    }
  }, [selectedPhenotype]);

  const handleReset = () => {
    const initialState = getInitialState();
    dispatch(
      updateBrowsePhenotypes(initialState.browsePhenotypes)
    );
    dispatch(
      updateBrowsePhenotypesPlots(initialState.browsePhenotypesPlots)
    );
  }

  useEffect(() => {
    // console.log("useEffect() triggered!");
    if (submitted || !phenotypes) return;
    plotContainer.current.innerHTML = '';
    // console.log("currentBubbleData", currentBubbleData);
    drawBubbleChart(currentBubbleData ? currentBubbleData : phenotypes.tree);
  }, [phenotypes, breadCrumb, currentBubbleData, selectedPhenotype, submitted])

  const drawBubbleChart = (data) => {
    new Plot(plotContainer.current, data, handleSingleClick, handleDoubleClick, handleBackgroundDoubleClick, selectedPhenotype, categoryColor);
  }

  const handleSingleClick = (e) => {
    if (e) {
      if (e.data.children && e.data.children.length > 0) {
        // parent
        const color = getColor(e.data);
        dispatch(updateBrowsePhenotypes({
          selectedPhenotype: null,
          categoryColor: color,
          currentBubbleData: e.data.children,
          breadCrumb: [...breadCrumb, e],
          displayTreeParent: e
        }));
      } else {
        //leaf
        dispatch(updateBrowsePhenotypes({
          selectedPhenotype: e.data,
          displayTreeParent: e
        }));
      }
    } else {
      // background is clicked
      setSelectedPhenotype(null);
    }
  }

  const handleDoubleClick = (e) => {
    if (e.data.children && e.data.children.length > 0) {
      // parent
      const color = getColor(e.data);
      dispatch(updateBrowsePhenotypes({
        selectedPhenotype: null,
        categoryColor: color,
        currentBubbleData: e.data.children,
        breadCrumb: [...breadCrumb, e],
        displayTreeParent: e
      }));
    } else {
      // leaf
      handleSubmit(e.data);
    }
  }

  const handleBackgroundDoubleClick = () => {
    if (breadCrumb.length >= 1) {
      if (breadCrumb.length === 1) {
        setCategoryColor(null);
      }
      const crumbParents = getParents(breadCrumb[breadCrumb.length - 1].data);
      dispatch(updateBrowsePhenotypes({
        breadCrumb: [...breadCrumb.splice(0, breadCrumb.length -  1)],
        currentBubbleData: crumbParents.length > 0 ? crumbParents[0].children : phenotypes.tree
      }));
    }
  }

  const crumbClick = (item, idx) => {
    const crumbParents = getParents(item.data);
    if (idx === 0) {
      setCategoryColor(null);
    }
    let newBreadCrumb = breadCrumb.splice(0, idx);
    dispatch(updateBrowsePhenotypes({
      breadCrumb: newBreadCrumb,
      currentBubbleData: crumbParents.length > 0 ? crumbParents[0].children : phenotypes.tree,
      selectedPhenotype: null
    }));
  }

  return (
    <SidebarContainer
      className="m-3"
      collapsed={!openSidebar}
      onCollapsed={collapsed => setOpenSidebar(!collapsed)}>
      <SidebarPanel className="col-lg-3">
        <div className="px-2 pt-2 pb-3 bg-white tab-pane-bordered rounded-0">
          <PhenotypesForm
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
        {submitted
          ? <PhenotypesTabs />
          : <div
              className={
                phenotypes ?
                "bg-white tab-pane-bordered rounded-0 p-3" :
                "bg-white tab-pane-bordered rounded-0 p-3 d-flex justify-content-center align-items-center"
              }
              style={{
                position: 'static',
                minHeight: '324px'
              }}>
              <LoadingOverlay active={!phenotypes || loading} />
              <div style={{
                  display: phenotypes ? 'block' : 'none',
                  position: 'relative'
                }}
                id="browse-phenotypes-container">
                {
                  breadCrumb.length > 0 && breadCrumb.map((item, idx) =>
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
                  breadCrumb.length === 0 &&
                  <br />
                }
                <div
                  ref={plotContainer}
                  className="mt-5 bubble-chart text-center"
                  id="bubble-chart-div"
                  style={{ minHeight: '50vh', 
                  position: 'relative'
                }}
                />
              </div>
            </div>
        }
      </MainPanel>
    </SidebarContainer>
  );
}
