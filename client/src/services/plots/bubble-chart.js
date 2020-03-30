import * as d3 from 'd3'

export class BubbleChart {
    constructor(container, currentData, handleSingleClick, handleDoubleClick, handleBackgroundDoubleClick, selectedPhenotype, categoryColor) {
        // console.log("bubble-chart service reached!", realData);
        this.container = container;
        this.handleSingleClick = handleSingleClick;
        this.handleDoubleClick = handleDoubleClick;
        this.handleBackgroundDoubleClick = handleBackgroundDoubleClick;
        this.selectedPhenotype = selectedPhenotype;
        this.categoryColor = categoryColor;
        if (currentData && currentData.length > 0) {
            this.currentData = {
                children: currentData
            };
            this.drawBubbleChart(this.container, this.currentData, this.handleSingleClick, this.handleDoubleClick, this.handleBackgroundDoubleClick, this.selectedPhenotype, this.categoryColor);
        }
    }

    drawBubbleChart(container, data, handleSingleClick, handleDoubleClick, handleBackgroundDoubleClick, selectedPhenotype, categoryColor) {
        var dataCopy = [];
        data.children.forEach((obj) => {
                dataCopy.push({
                    ...obj,
                    children: null
                })
            }
        );
        var childlessData = {
            children: dataCopy
        }

        d3.selectAll(".bubble")
            .remove()

        var diameter = 750;

        var svg = d3.select(container)
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble")
            .attr("id", "bubble-chart-svg");

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
                        return getChildren(d, data) ? "100%" : "50%";
                    });
                d3.selectAll(".node")
                    .select(".inner-circle")
                    .style("opacity", function (d) {
                        return "75%";
                    });
                handleSingleClick(null);
            })
            .on("dblclick", function() {
                handleBackgroundDoubleClick();
            })
            .append("title")
            .text("Double-click to navigate phenotype categories.\nSingle-click to select a phenotype.");

        var nodes = d3.hierarchy(childlessData)
            .each(function (d) {
                d.value = d.data.participant_count;
            })
            .sort(function(a, b) { return b.value - a.value; })

        var bubble = d3.pack()
            .size([diameter, diameter])
            .padding(1.5);

        var bubbleNodes = bubble(nodes).descendants();

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

        // node.append("title")
        //     .text(function (d) {
                
        //         if (getChildren(d, data)) {
        //             return "Category: " + d.data.title + "\n" + "Participants: " + d.data.participant_count.toLocaleString();
        //         } else {
        //             return "Phenotype: " + d.data.title + "\n" + "Participants: " + d.data.participant_count.toLocaleString();
        //         }
        //     });

        node.append("circle")
            .attr("r", function (d) {
                return d.r;
            })
            .style("fill", function (d) {
                return d.data.color ? d.data.color : categoryColor ? categoryColor : "#fd79a8";
            })
            .style("opacity", function (d) {
                return getChildren(d, data) ? "100%" : "50%";
            })
            .attr("class", "circle");

        node.append("circle")
            .attr("r", function (d) {
                return getChildren(d, data) && d.r >= 5? d.r - 5 : 0;
            })
            .style("fill", "#FFFFFF")
            .attr("class", "inner-circle-background");
        
        node.append("circle")
            .attr("r", function (d) {
                return getChildren(d, data) && d.r >= 5 ? d.r - 5 : 0;
            })
            .style("fill", function (d) {
                return d.data.color ? d.data.color : categoryColor ? categoryColor : "#fd79a8";
            })
            .style("opacity", function (d) {
                return "75%";
            })
            .attr("class", "inner-circle");

        node.append("text")
            .attr("dy", "0em")
            .style("text-anchor", "middle")
            .text(function (d) {
                if (d.r < 35) {
                    return ""+ "<br>" + "";
                } else {
                    return d.data.title + "<br>" + d.data.participant_count;
                }
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function (d) {
                return d.r / 6 < 10 ? 10 : d.r / 6;
            })
            .attr("fill", function(d) {
                return getChildren(d, data) ? "white" : "black";
            })
            .call(wrap, 18);

        node.on("click", function (e) {
            if (!getChildren(e, data)) {
                d3.selectAll(".circle")
                    .style("opacity", function (d) {
                        return getChildren(d, data) ? "75%" : "25%";
                    });
                d3.selectAll(".inner-circle")
                    .style("opacity", function (d) {
                        return "50%";
                    });
                d3.selectAll(".node")
                    .filter(function (d) {
                        return d === e;
                    })
                    .select(".circle")
                    .style("opacity", function (d) {
                        return "75%";
                    });
            }
            handleSingleClick(getNode(e, data));
        });

        node.on("dblclick", function (e) {
            handleDoubleClick(getNode(e, data));
        });

        var tooltip = d3.select(container)
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip border")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("padding", "2px");

        var showTooltip = function(d) {    
            tooltip
                .transition()
                .duration(200);
            tooltip
                .style("opacity", 1)
                .html((getChildren(d, data) ? "Category: " : "Phenotype: ") + "<b>" + d.data.title + "</b><br>" + "Participants: <b>" + Number(d.data.participant_count).toLocaleString() + "</b>")
                .style("left", (d.x + 250) + "px")
                .style("top", (d.y) + "px");
            d3.select(this)
                .select(".circle")
                .style("stroke", function (d) {
                    return "black";
                });
        }

        var hideTooltip = function(d) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0);
            d3.select(this)
                .select(".circle")
                .style("stroke", function (d) {
                    return "transparent";
                });
        }

        node.on("mouseover", showTooltip)
            .on("mouseleave", hideTooltip);

        d3.select(container)
            .style("height", diameter + "px");

        if (selectedPhenotype) {
            d3.selectAll(".circle")
                .style("opacity", function (d) {
                    return getChildren(d, data) ? "75%" : "25%";
                });
            d3.selectAll(".inner-circle")
                .style("opacity", function (d) {
                    return "50%";
                });
            d3.selectAll(".node")
                .filter(function (d) {
                    return d.data.id === selectedPhenotype.id;
                })
                .select(".circle")
                .style("opacity", function (d) {
                    return "75%";
                });
        }

    }

}

function getChildren(node, data) {
    // console.log("getChildren", node, data);
    var results = data.children.filter((child) => {
        return child.id === node.data.id;
    });
    if (results.length > 0) {
        var children = results[0].children;
        return children;
    } else {
        return null;
    }
}

function getNode(node, data) {
    var results = data.children.filter((child) => {
        return child.id === node.data.id;
    });
    if (results.length > 0) {
        return {
            data: results[0]
        };
    } else {
        return null;
    }
}

function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this);
        var label = text.text().split('<br>')[0],
            value = text.text().split('<br>')[1],
            words = label.split(/[\s]/).reverse(),
            word,
            line = [],
            lineNumber = 1,
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (words.length > 0 && lineNumber < 3) {
            word = words.pop()
            line.push(word);
            tspan.text(line.join(" "));
            if ((line.join(" ").length > width)) {
                lineNumber += 1;
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "1em").text(lineNumber === 3 && words.length > 0 ? word + "..." : word);
            } 
        }
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "1.2em").text(value.length > 0 ? Number(value).toLocaleString() : "");
    });
  }