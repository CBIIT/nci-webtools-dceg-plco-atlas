import React, { useState } from 'react';
import BubbleChart from '@weknow/react-bubble-chart-d3';
import { Icon } from '../controls/icon';

export function BubbleChartContainer({
  data,
  dataAlphabetical,
  dataCategories
}) {

  console.log("data", data);
  console.log("dataAlphabetical", dataAlphabetical);
  console.log("dataCategories", dataCategories);

  // d3 bubble chart
  const [bubbleData, setBubbleData] = useState([
    { label: 'CRM', value: 1 },
    { label: 'API', value: 1 },
    { label: 'Data', value: 1 },
    { label: 'Commerce', value: 1 },
    { label: 'AI', value: 1 },
    { label: 'Management', value: 1 },
    { label: 'Testing', value: 1 },
  ]);

  // const legendFont = {
  //   family: 'Arial',
  //   size: 12,
  //   color: '#000',
  //   weight: 'bold',
  // };

  const labelFont = {
    family: 'Arial',
    size: 16,
    color: '#fff',
    weight: 'bold',
  };

  const valueFont = {
    family: 'Arial',
    size: 12,
    color: '#fff',
    weight: 'bold',
  };

  const bubbleClick = (label) =>{
    // console.log("Custom bubble click func", label);
    setBubbleData([
      { label: 'Mobile', value: 1 },
      { label: 'Conversion', value: 1 },
      { label: 'Misc', value: 1 },
      { label: 'Databases', value: 1 },
      { label: 'DevOps', value: 1 },
      { label: 'Javascript', value: 1 },
      { label: 'Languages / Frameworks', value: 1 },
      { label: 'Front End', value: 1 },
      { label: 'Content', value: 1 },
    ]);
  }
  
  // const legendClick = (label) =>{
  //   // console.log("Customer legend click func", label);
  // }
  
  return (
    <>
      <div className="text-left">
        <a href="javascript:void(0)" onClick={_ => setBubbleData([
          { label: 'CRM', value: 1 },
          { label: 'API', value: 1 },
          { label: 'Data', value: 1 },
          { label: 'Commerce', value: 1 },
          { label: 'AI', value: 1 },
          { label: 'Management', value: 1 },
          { label: 'Testing', value: 1 },
        ])}>
          All Phenotypes
        </a>
        <Icon
          name="arrow-left"
          className="mx-2 opacity-50"
          width="10"
        />
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
        // legendPercentage={20} // number that represent the % of with that legend going to use.
        // legendFont={legendFont}
        labelFont={labelFont}
        valueFont={valueFont}
        //Custom bubble/legend click functions such as searching using the label, redirecting to other page
        bubbleClickFun={bubbleClick}
        // legendClickFun={legendClick}
        data={bubbleData}
        // overflow={true}
      />
    </>
  );
}
