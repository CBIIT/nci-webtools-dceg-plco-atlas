import * as d3 from 'd3'

export class BubbleChart {
    constructor(container, realData, handleSingleClick, handleDoubleClick, handleBackgroundDoubleClick, selectedPhenotype) {
        // console.log("bubble-chart service reached!", realData);
        this.container = container;
        this.handleSingleClick = handleSingleClick;
        this.handleDoubleClick = handleDoubleClick;
        this.handleBackgroundDoubleClick = handleBackgroundDoubleClick;
        this.selectedPhenotype = selectedPhenotype;
        if (realData && realData.length > 0) {
            this.realDataset = {
                children: realData
            };
            this.drawBubbleChart(this.container, this.realDataset, this.handleSingleClick, this.handleDoubleClick, this.handleBackgroundDoubleClick, this.selectedPhenotype);
        }
    }

    drawBubbleChart(container, dataset, handleSingleClick, handleDoubleClick, handleBackgroundDoubleClick, selectedPhenotype) {
        // console.log("data reached drawBubbleChart() d3", dataset);
        console.log("selectedPhenotype", selectedPhenotype);

        d3.selectAll(".bubble")
            .remove()

        var diameter = 800;
        // const normalize = (val, min, max) => {
        //     return (val - min) / (max - min);
        // }

        var bubble = d3.pack(dataset)
            .size([diameter, diameter])
            // .radius(function (d) {
            //     // return sizeScale(d.value);
            //     return normalize(d.count, 20, 50);
            // })
            .padding(1.5);

        var svg = d3.select(container)
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");


        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", diameter)
            .attr("height", diameter)
            .style("fill", "white")
            .style("opacity", "0%")
            .on("click", function() { 
                d3.selectAll(".node")
                    .select(".circle")
                    .style("opacity", function (d) {
                        return "100%";
                    });
                handleSingleClick(null);
            })
            .on("dblclick", function() {
                handleBackgroundDoubleClick();
            });

        var nodes = d3.hierarchy(dataset)
            .sum(function (d) {
                return d.count ? d.count : 0; 
            });

        var bubbleNodes = bubble(nodes).descendants()
            .filter(function(d) {
                // console.log("filter bubble nodes", d);
                if (selectedPhenotype) {
                    console.log("filter bubble nodes", d.data, selectedPhenotype);
                    return true;
                    // return d.data === selectedPhenotype;
                } else {
                    return true;
                }
            });

        // console.log("bubbleNodes", bubbleNodes);
        // console.log("bubbleNodes[0].parent.children", selectedPhenotype ? bubbleNodes[0].parent.children : null);

        // console.log("bubble(nodes).descendants()", bubble(nodes).descendants());
        // find a way to only output first level of tree as nodes
        var node = svg.selectAll(".node")
            // .data(selectedPhenotype ? bubbleNodes[0].parent.children : bubbleNodes)
            .data(bubbleNodes)
            .enter()
            .filter(function (d) {
                return d.depth === 1;
            })
            .append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + d.x + ", " + d.y + ")";
            });

        node.append("title")
            .text(function (d) {
                return d.data.title + ": " + d.value;
            });

        node.append("circle")
            .attr("r", function (d) {
                return d.r;
            })
            .style("fill", function (d) {
                return d.data.color ? d.data.color : "pink";
            })
            .attr("class", "circle");

        node.append("circle")
            .attr("r", function (d) {
                return d.r - 10;
            })
            .style("fill", "#FFFFFF")
            .style("opacity", "50%")
            .attr("class", "inner-circle-background");
        
        node.append("circle")
            .attr("r", function (d) {
                return d.r - 10;
            })
            .style("fill", function (d) {
                return d.children ? d.data.color ? d.data.color : "pink" : "#FFFFFF";
            })
            .style("opacity", function (d) {
                return d.children ? "20%" : "100%";
            })
            .attr("class", "inner-circle");

        node.append("text")
            .style("text-anchor", "middle")
            .text(function (d) {
                return d.value;
            })
            .attr("font-family", "Gill Sans", "Gill Sans MT")
            .attr("font-size", function (d) {
                return d.r / 5 < 10 ? 10 : d.r / 5;
            })
            .attr("fill", function(d) {
                return "black";
            });

        node.append("text")
            .attr("class", "phenotype-title")
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(function (d) {
                return d.data.title;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function (d) {
                return d.r / 6 < 10 ? 10 : d.r / 6;
            })
            .attr("fill", function(d) {
                return "black"
            });

        node.on("click", function (e) {
            // console.log(e.children);
            d3.selectAll(".circle")
                .style("opacity", function (d) {
                    return "50%";
                });
            d3.selectAll(".node")
                .filter(function (d) {
                    return d === e;
                })
                .select(".circle")
                .style("opacity", function (d) {
                    return "100%";
                });
            handleSingleClick(e);
        });

        node.on("dblclick", function (e) {
            handleDoubleClick(e);
        });

        d3.selectAll(".phenotype-title")
            .call(wrap, 18);

        d3.select(container)
            .style("height", diameter + "px");

        if (selectedPhenotype) {
            d3.selectAll(".circle")
                .style("opacity", function (d) {
                    return "50%";
                });
            d3.selectAll(".node")
                .filter(function (d) {
                    // console.log(d, selectedPhenotype);
                    return d.data === selectedPhenotype;
                })
                .select(".circle")
                .style("opacity", function (d) {
                    return "100%";
                });
        }

    }

    

}

function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = .1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (line.join(" ").length > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }