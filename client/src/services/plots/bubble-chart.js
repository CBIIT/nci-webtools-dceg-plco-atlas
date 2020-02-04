import * as d3 from 'd3'

export class BubbleChart {
    constructor(container, realData, handleSingleClick, handleDoubleClick, handleBackgroundDoubleClick) {
        // console.log("bubble-chart service reached!", realData);
        this.container = container;
        this.handleSingleClick = handleSingleClick;
        this.handleDoubleClick = handleDoubleClick;
        this.handleBackgroundDoubleClick = handleBackgroundDoubleClick
        if (realData && realData.length > 0) {
            this.realDataset = {
                children: realData
            };
            this.drawBubbleChart(this.container, this.realDataset, this.handleSingleClick, this.handleDoubleClick, this.handleBackgroundDoubleClick);
        }
    }

    drawBubbleChart(container, dataset, handleSingleClick, handleDoubleClick, handleBackgroundDoubleClick) {
        // console.log("data reached drawBubbleChart() d3", dataset);

        d3.selectAll(".bubble")
            .remove()

        var diameter = 800;
        // var color = d3.scaleOrdinal(d3.schemeCategory20);
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
            })
            .on("dblclick", function() {
                handleBackgroundDoubleClick();
            });

        var nodes = d3.hierarchy(dataset)
            .sum(function (d) {
                // console.log("d", d);
                return d.count ? d.count : 0; 
                // return 100;
            });

        // find a way to only output first level of tree as nodes
        var node = svg.selectAll(".node")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(function (d) {
                // console.log("d", d);
                // return !d.children
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
                // console.log("d.r", d.r)
                return d.r;
            })
            .style("fill", function (d) {
                // color leaf bubbles #007bff (bluish)
                console.log("AH COLOR", d);
                // return d.children ? "orange" : "#007bff";
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
                // console.log("d.r", d.r)
                return d.r - 10;
            })
            .style("fill", function (d) {
                // color leaf bubbles #007bff
                // return d.children ? "orange" : "#FFFFFF";
                return d.children ? d.data.color ? d.data.color : "pink" : "#FFFFFF";
            })
            .style("opacity", function (d) {
                return d.children ? "20%" : "100%";
            })
            .attr("class", "inner-circle");

        node.append("text")
            .attr("dy", ".2em")
            .style("text-anchor", "middle")
            // .style("user-select", "none")
            .text(function (d) {
                // do someting clever to prevent text overflow here
                return d.data.title.substring(0, d.r / 3);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function (d) {
                return d.r / 6;
            })
            .attr("fill", function(d) {
                // return d.children ? "white" : "black";
                return "black"
            });

        node.append("text")
            .attr("dy", "1.3em")
            .style("text-anchor", "middle")
            // .style("user-select", "none")
            .text(function (d) {
                return d.value;
            })
            .attr("font-family", "Gill Sans", "Gill Sans MT")
            .attr("font-size", function (d) {
                return d.r / 5;
            })
            .attr("fill", function(d) {
                // return d.children ? "white" : "black";
                return "black";
            });

        node.on("click", function (e) {
            // console.log("node clicked!", e);
            d3.selectAll(".circle")
                .style("opacity", function (d) {
                    return "50%";
                });
            d3.selectAll(".node")
                .filter(function (d) {
                    // console.log("!", d, e, d === e);
                    return d === e;
                })
                .select(".circle")
                .style("opacity", function (d) {
                    return "100%";
                });
            handleSingleClick(e);
        });

        node.on("dblclick", function (e) {
            // console.log("node double-clicked!", e);
            handleDoubleClick(e);
        });

        d3.select(container)
            .style("height", diameter + "px");

    }

}