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
                        return d.children ? "100%" : "50%";
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

        var nodes = d3.hierarchy(data)
            .sum(function (d) {
                return d.participant_count ? d.participant_count : 100000; 
            });

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

        node.append("title")
            .text(function (d) {
                if (d.children) {
                    return "Category: " + d.data.title + "\n" + "Participants: " + d.data.participant_count.toLocaleString();
                } else {
                    return "Phenotype: " + d.data.title + "\n" + "Participants: " + d.data.participant_count.toLocaleString();
                }
            });

        node.append("circle")
            .attr("r", function (d) {
                return d.r;
            })
            .style("fill", function (d) {
                return d.data.color ? d.data.color : categoryColor ? categoryColor : "pink";
            })
            .style("opacity", function (d) {
                return d.children ? "100%" : "50%";
            })
            .attr("class", "circle");

        node.append("circle")
            .attr("r", function (d) {
                return d.children ? d.r - 5 : 0;
            })
            .style("fill", "#FFFFFF")
            .attr("class", "inner-circle-background");
        
        node.append("circle")
            .attr("r", function (d) {
                return d.children ? d.r - 5 : 0;
            })
            .style("fill", function (d) {
                return d.data.color ? d.data.color : categoryColor ? categoryColor : "pink";
            })
            .style("opacity", function (d) {
                return "75%";
            })
            .attr("class", "inner-circle");

        node.append("text")
            .attr("dy", "0em")
            .style("text-anchor", "middle")
            .text(function (d) {
                console.log("D", d);
                if (d.r < 15) {
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
                return d.children ? "white" : "black";
            })
            .call(wrap, 18);

        node.on("click", function (e) {
            if (!e.children) {
                d3.selectAll(".circle")
                    .style("opacity", function (d) {
                        return d.children ? "75%" : "25%";
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
                    return d.children ? "75%" : "25%";
                });
            d3.selectAll(".inner-circle")
                .style("opacity", function (d) {
                    return "50%";
                });
            d3.selectAll(".node")
                .filter(function (d) {
                    return d.data.title === selectedPhenotype.title && d.data.value === selectedPhenotype.value;
                })
                .select(".circle")
                .style("opacity", function (d) {
                    return "75%";
                });
        }

    }

}

function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this);
        var label = text.text().split('<br>')[0],
            value = text.text().split('<br>')[1],
            words = label.split(/[/\s+]/).reverse(),
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
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "1em").text(lineNumber === 3 && words.length > 0 ? word + " ..." : word);
            } 
        }
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "1.2em").text(value.length > 0 ? Number(value).toLocaleString() : "");
    });
  }