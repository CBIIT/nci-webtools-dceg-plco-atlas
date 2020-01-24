import React, { useState } from 'react';
import BubbleChart from '@weknow/react-bubble-chart-d3';
import { Icon } from '../controls/icon';

export function BubbleChartContainer() {
  const randomIntGen = () => {
    return Math.floor(Math.random() * 10) + 1;
  }

  // d3 bubble chart
  const [bubbleData, setBubbleData] = useState([
    { label: 'CRM', value: randomIntGen() },
    { label: 'API', value: randomIntGen() },
    { label: 'Data', value: randomIntGen() },
    { label: 'Commerce', value: randomIntGen() },
    { label: 'AI', value: randomIntGen() },
    { label: 'Management', value: randomIntGen() },
    { label: 'Testing', value: randomIntGen() },
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
      { label: 'Mobile', value: randomIntGen() },
      { label: 'Conversion', value: randomIntGen() },
      { label: 'Misc', value: randomIntGen() },
      { label: 'Databases', value: randomIntGen() },
      { label: 'DevOps', value: randomIntGen() },
      { label: 'Javascript', value: randomIntGen() },
      { label: 'Languages / Frameworks', value: randomIntGen() },
      { label: 'Front End', value: randomIntGen() },
      { label: 'Content', value: randomIntGen() },
    ]);
  }
  
  // const legendClick = (label) =>{
  //   // console.log("Customer legend click func", label);
  // }
  
  return (
    <>
      <div className="text-left">
        <a href="javascript:void(0)" onClick={_ => setBubbleData([
          { label: 'CRM', value: randomIntGen() },
          { label: 'API', value: randomIntGen() },
          { label: 'Data', value: randomIntGen() },
          { label: 'Commerce', value: randomIntGen() },
          { label: 'AI', value: randomIntGen() },
          { label: 'Management', value: randomIntGen() },
          { label: 'Testing', value: randomIntGen() },
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
