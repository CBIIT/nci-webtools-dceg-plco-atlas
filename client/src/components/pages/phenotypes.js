import React, { useState, useRef, useEffect} from 'react';
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
// import { BubbleChartContainer } from '../plots/bubble-chart';
import { BubbleChart as Plot } from '../../services/plots/bubble-chart';
import { Icon } from '../controls/icon';

export function Phenotypes() {
  const dispatch = useDispatch();
  const {
    selectedPhenotype,
    messages,
    submitted
  } = useSelector(state => state.browsePhenotypes);

  const plotContainer = useRef(null);
  // const plot = useRef(null);
  const [breadcrumb, setBreadcrumb] = useState([]);

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

  const dataset = {
    "children": [
        {title: "Olives", count: 4319},
        {title: "Tea", count: 4159},
        {title: "Mashed Potatoes", count: 2583},
        {title: "Boiled Potatoes", count: 2074},
        {title: "Milk", count: 1894},
        {title: "Chicken Salad", count: 1809},
        {title: "Vanilla Ice Cream", count: 1713},
        {title: "Cocoa", count: 1636},
        {title: "Lettuce Salad", count: 1566},
        {title: "Lobster Salad", count: 1511},
        {title: "Chocolate", count: 1489},
        {title: "Apple Pie", count: 1487},
        {title: "Orange Juice", count: 1423},
        {title: "American Cheese", count: 1372},
        {title: "Green Peas", count: 1341},
        {title: "Assorted Cakes", count: 1331},
        {title: "French Fried Potatoes", count: 1328},
        {title: "Potato Salad", count: 1306},
        {title: "Baked Potatoes", count: 1293},
        {title: "Roquefort", count: 1273},
        {title: "Stewed Prunes", count: 1268}
    ]
  };

  useEffect(() => {
    if (submitted || !phenotypesTree) return;
    plotContainer.current.innerHTML = '';
    drawBubbleChart(phenotypesTree);
  })

  const drawBubbleChart = (data) => {
    new Plot(plotContainer.current, dataset, data, setBreadcrumb);
  }

  // useEffect(() => {
  //   plot.current && plot.current.redraw();
  // }, [panelCollapsed]);

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
          <div className="bg-white border rounded-0 p-4">

            {/* <BubbleChartContainer 
              data={phenotypesTree}
              dataAlphabetical={alphabetizedPhenotypes}
              dataCategories={phenotypeCategories}
              onSubmit={handleSubmit}
            /> */}

            {
              breadcrumb.map((item) =>
                <span className="" key={"crumb-" + item.data.title}>
                  <a 
                    href="javascript:void(0)" 
                    // onClick={_ => crumbClick(item)}
                  >
                    {item.data.title}
                  </a>
                  <Icon
                    name="arrow-left"
                    className="mx-2 opacity-50"
                    width="10"
                  />
                </span>
              )
            }
            <div
              ref={plotContainer}
              className="bubble-chart text-center"
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
