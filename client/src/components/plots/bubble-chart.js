import React, { useState } from 'react';
import BubbleChart from '@weknow/react-bubble-chart-d3';
import { Icon } from '../controls/icon';

export function BubbleChartContainer({
  data,
  dataAlphabetical,
  dataCategories,
  onSubmit
}) {

  const initialData = data.map((item) => {
    return {
      label: item.title,
      value: 1
    }
  });

  // d3 bubble chart
  const [bubbleData, setBubbleData] = useState(initialData);
  const [breadCrumb, setBreadCrumb] =  useState([]);

  // const legendFont = {
  //   family: 'Arial',
  //   size: 12,
  //   color: '#000',
  //   weight: 'bold',
  // };

  const labelFont = {
    family: 'Arial',
    size: 10,
    color: '#fff',
    weight: 'bold',
  };

  const valueFont = {
    family: 'Arial',
    size: 12,
    color: '#fff',
    // weight: 'bold',
  };

  const bubbleClick = (label) =>{
    if (dataAlphabetical.map((item) => item.title).includes(label)) {
      // is leaf
      let found = dataAlphabetical.filter(item => item.title === label);
      if (found.length > 0) {
        onSubmit(found[0]);
      }
    } else {
      // is parent
      dataCategories.map((item) => {
        if (item.title === label) {
          if (item.children && item.children.length > 0) {
            // has children
            let next = item.children.map((item) => {
              return {
                label: item.title,
                value: 1
              }
            });
            setBubbleData(next);
            if (breadCrumb.length === 0) {
              setBreadCrumb(breadCrumb.concat("All Phenotypes"));
            } else {
              if (!breadCrumb.includes(label)) {
                setBreadCrumb(breadCrumb.concat(label));
              }
            }
          } 
        }
      });
    }
  };

  const crumbClick = (label) => {
    if (label === "All Phenotypes") {
      setBubbleData(initialData);
      setBreadCrumb([]);
    } else {
      // get parent
      dataCategories.map((parentItem) => {
        parentItem.children.map((childrenItem) => {
          if (childrenItem.title === label) {
            dataCategories.map((item) => {
              if (item.title === parentItem.title) {
                // has children
                let next = item.children.map((item) => {
                  return {
                    label: item.title,
                    value: 1
                  }
                });
                setBubbleData(next);
              }
            });
            // trim breadCrumbs
            setBreadCrumb(breadCrumb.slice(0, breadCrumb.indexOf(label)));
          }
        })
      });
    }
  };
  
  return (
    <>
      <div className="text-left">
        {
          breadCrumb && breadCrumb.length > 0 && breadCrumb.map((item) => (
            <span className="" key={"crumb-" + item}>
              <a 
                href="javascript:void(0)" 
                onClick={_ => crumbClick(item)}>
                {item}
              </a>
              <Icon
                name="arrow-left"
                className="mx-2 opacity-50"
                width="10"
              />
            </span>
          ))
        }
      </div> 
      <BubbleChart
        graph= {{
          zoom: 1,
          // offsetX: -0.05,
          // offsetY: -0.01,
        }}
        width={800}
        height={800}
        padding={0} // optional value, number that set the padding between bubbles
        showLegend={false} // optional value, pass false to disable the legend.
        labelFont={labelFont}
        valueFont={valueFont}
        bubbleClickFun={bubbleClick}
        data={bubbleData.length > 0 ? bubbleData : initialData}
        // overflow={true}
      />
    </>
  );
}
