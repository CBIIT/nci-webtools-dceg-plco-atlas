import * as d3 from 'd3'

export class BubbleChart {
    constructor(container, currentData, handleSingleClick, handleDoubleClick, handleBackgroundDoubleClick, selectedPhenotype) {
        // console.log("bubble-chart service reached!", realData);
        this.container = container;
        this.handleSingleClick = handleSingleClick;
        this.handleDoubleClick = handleDoubleClick;
        this.handleBackgroundDoubleClick = handleBackgroundDoubleClick;
        this.selectedPhenotype = selectedPhenotype;
        if (currentData && currentData.length > 0) {
            this.currentData = {
                children: currentData
            };
            this.drawBubbleChart(this.container, this.currentData, this.handleSingleClick, this.handleDoubleClick, this.handleBackgroundDoubleClick, this.selectedPhenotype);
        }
    }

    drawBubbleChart(container, data, handleSingleClick, handleDoubleClick, handleBackgroundDoubleClick, selectedPhenotype) {
        // console.log("data reached drawBubbleChart() d3", dataset);

        d3.selectAll(".bubble")
            .remove()

        var diameter = 750;
        // var linearScale = d3.scaleLinear()
        //     .domain([500, 19200])
        //     .range([25, 250]);

        var bubble = d3.pack(data)
            .size([diameter, diameter])
            // .radius(function (d) {
            //     // return sizeScale(d.value);
            //     // return normalize(d.count, 20, 50);
            //     return linearScale(d.value);
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

        var nodes = d3.hierarchy(data)
            .sum(function (d) {
                return d.count ? d.count : 0; 
            });

        var bubbleNodes = bubble(nodes).descendants();
            
        // console.log("bubble(nodes).descendants()", bubble(nodes).descendants());
        // console.log("bubble(nodes).links()", bubble(nodes).links());

        var node = svg.selectAll(".node")
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
            // .style("opacity", "100%")
            .attr("class", "inner-circle-background");
        
        node.append("circle")
            .attr("r", function (d) {
                return d.r - 10;
            })
            .style("fill", function (d) {
                return d.data.color ? d.data.color : "pink";
            })
            .style("opacity", function (d) {
                return d.children ? "75%" : "25%";
            })
            .attr("class", "inner-circle");

        node.append("text")
            .attr("dy", "0em")
            .style("text-anchor", "middle")
            .text(function (d) {
                return [d.data.title, d.value];
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function (d) {
                return d.r / 6 < 10 ? 10 : d.r / 6;
            })
            .attr("fill", function(d) {
                return d.children ? "white" : "black";
            })
            .call(wrap, 18);

        node.on("click", function (e) {
            if (!e.children) {
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
            }
            handleSingleClick(e);
        });

        node.on("dblclick", function (e) {
            handleDoubleClick(e);
        });

        d3.select(container)
            .style("height", diameter + "px");

        if (selectedPhenotype) {
            d3.selectAll(".circle")
                .style("opacity", function (d) {
                    return "50%";
                });
            d3.selectAll(".node")
                .filter(function (d) {
                    return d.data.title === selectedPhenotype.title && d.data.value === selectedPhenotype.value;
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
            label = text.text().split(',')[0],
            value = text.text().split(',')[1],
            words = label.split(/[/\s+]/).reverse(),
            word,
            line = [],
            // lineNumber = 0,
            // lineHeight = 1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (words.length > 0) {
            word = words.pop()
            line.push(word);
            tspan.text(line.join(" "));
            if (line.join(" ").length > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "1em").text(word);
            }
        }
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "1.2em").text(Number(value).toLocaleString());
    });
  }