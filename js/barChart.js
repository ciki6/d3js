
function drawBar() {
    var yOffset = {},
        yRecover = {},
        yRecoverDomain,
        isTransitioning = true,
        transitionDuration = 500;
    var formatPercent = d3.format(".0%");
    var formatNumber = d3.format(",");
    d3.csv('data/data1.csv', function(d, i, columns) {
        for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
        d.total = t;
        return d;
    }, function(error, data) {
        if (error) throw error;
        var keys =data.columns.slice(1);
        data.sort(function(a, b) { return b.total - a.total; });
        var layers = d3.stack().keys(keys)(data);
        var yStackMax = d3.max(data.map(d => d.total));
        var yGroupMax = d3.max(data, function(data) {
            return d3.max(keys, function(key) {
                return data[key];
            });
        });

        var margin = {top: 100, right: 5, bottom: 510, left: 70},
            width = 650 - margin.left - margin.right,
            height = 1000 - margin.top - margin.bottom;

        var x = d3.scaleBand()
            .domain(data.map(d => d.Description))
            .rangeRound([0, width])
            .padding(0.1)
            .align(0.1);

        var x2= d3.scaleBand()
            .domain(keys)
            .rangeRound([0, x.bandwidth()])
            .padding(0.1)
            .align(0.1);

        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d.total; })]).nice()
            .rangeRound([height, 0]);

        var color = d3.scaleOrdinal()
            .domain(data.map(d => d.Description))
            .range(["#FF6347", "#1E90FF"]);

        var xAxis = d3.axisBottom()
            .scale(x)
            .tickSize(0)
            .tickPadding(6);

        var yAxis = d3.axisLeft()
            .scale(y)
            .tickSize(2)
            .tickPadding(6);

        var svg = d3.select(".barChart").append("svg")
            .attr('class','barChartSVG')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.select('.barChartSVG').append('g')
            .attr('class', 'tip')
            .append('text')
            .attr('class', 'tipName')
            .attr('stroke', '#000')
            .attr('x', width + margin.right + margin.left)
            .attr('y', 25)
            .style('text-anchor', 'end')
            .text('');
        d3.select('.barChartSVG').select('.tip')
            .append('text')
            .attr('class', 'tipMalesValue')
            .attr('stroke', '#000')
            .attr('x', width + margin.right + margin.left)
            .attr('y', 50)
            .style('text-anchor', 'end')
            .text('');
        d3.select('.barChartSVG').select('.tip')
            .append('text')
            .attr('class', 'tipFemalesValue')
            .attr('stroke', '#000')
            .attr('x', width + margin.right + margin.left)
            .attr('y', 75)
            .style('text-anchor', 'end')
            .text('');
        d3.select('.barChartSVG').select('.tip')
            .append('text')
            .attr('class', 'tipTotalValue')
            .attr('stroke', '#000')
            .attr('x', width + margin.right + margin.left)
            .attr('y', 100)
            .style('text-anchor', 'end')
            .text('');

        var layer = svg.selectAll(".layer")
            .data(layers)
            .enter().append("g")
            .attr("class", "layer")
            .attr("id", function(d) { return d.key; })
            .style("fill", function(d, i) { return color(i); });

        var rect = layer.selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr('class', 'bar')
            .attr("x", function(d) { return x(d.data.Description); })
            .attr("y", height)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr('name', function(d) {
                return d.data.Description
            })
            .attr('data_value', function(d){
                return d[1] - d[0]
            })
            .on("mouseenter", highlightLayer)
            .on("mouseout", restoreLayer);

        rect.transition()
            .delay(function(d, i) {return i * 10; })
            .attr("y", function(d) {
                return y(d[1]);
            })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-55)")
            .style('font-size', 12);

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + 0 + ",0)")
            .style("font-size", "10px")
            .call(yAxis)
            .selectAll('text')
            .style('font-size', 12);

        d3.selectAll("input").on("change", change);

        var timeout = setTimeout(function() {
            d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
            setTimeout(function() {
                d3.select("input[value=\"percent\"]").property("checked", true).each(change);
            }, 2000);
        }, 2000);

        function change() {
            clearTimeout(timeout);

            isTransitioning = true;
            setTimeout(function() {
                isTransitioning = false;
            }, transitionDuration * 3.5);

            if (this.value === "grouped") transitionGrouped();
            else if (this.value === "stacked") transitionStacked();
            else if (this.value === "percent") transitionPercent();
        }


        function transitionGrouped() {
            y.domain([0, yGroupMax]);

            rect.transition()
                .duration(transitionDuration)
                .delay(function(d, i) { return i * 10; })
                .attr("x", function(d, i, j) {
                    return x2(this.parentNode.id) + i *x.bandwidth();
                })
                .attr("width", x.bandwidth() / 2)
                .style('opacity', 1)
                .transition()
                .attr("y", function(d) {
                    return height - (y(d[0]) - y(d[1]));
                })
                .attr("height", function(d) {
                    return y(d[0]) - y(d[1]);
                })
                .on("end", setYRecover);

            yAxis.tickFormat(formatNumber);
            svg.selectAll(".y.axis").transition()
                .delay(transitionDuration)
                .duration(transitionDuration)
                .call(yAxis)
        }

        function transitionStacked() {
            y.domain([0, yStackMax]);

            rect.transition()
                .duration(transitionDuration)
                .delay(function(d, i) { return i * 10; })
                .attr("y", function(d) {
                    return y(d[1]);
                })
                .attr("height", function(d) {
                    return y(d[0]) - y(d[1]); }
                    )
                .style('opacity', 1)
                .transition()
                .attr("x", function(d) { return x(d.data.Description); })
                .attr("width", x.bandwidth())
                .on("end", setYRecover);

            yAxis.tickFormat(formatNumber);
            svg.selectAll(".y.axis").transition()
                .delay(transitionDuration)
                .duration(transitionDuration)
                .call(yAxis);
        }

        function transitionPercent() {
            y.domain([0, 1]);

            rect.transition()
                .duration(transitionDuration)
                .delay(function(d, i) { return i * 10; })
                .attr("y", function(d) {
                    return y(d[1] / d.data.total); })
                .attr("height", function(d) {
                    return y(d[0] / d.data.total) - y(d[1] / d.data.total); })
                .style('opacity', 1)
                .transition()
                .attr("x", function(d) { return x(d.data.Description); })
                .attr("width", x.bandwidth())
                .on("end", setYRecover);

            yAxis.tickFormat(formatPercent);
            svg.selectAll(".y.axis").transition()
                .delay(transitionDuration)
                .duration(transitionDuration)
                .call(yAxis);
        }

        function setYRecover(d,i) {
            id = d3.select(this.parentNode).attr("id");
            if (typeof(yRecover[i]) === 'undefined'){ yRecover[i] = []}
            yRecover[i][id] = parseFloat(d3.select(this).attr("y"));
            yRecoverDomain = y.domain();
        }

        function reSetYRecover(){
            for(let i = 0 ; i < 19; i++){
                if(yRecover[i]){
                    if(yRecover[i].length === 4){
                        yRecover[i][0] = yRecover[i][2];
                        yRecover[i][1] = yRecover[i][3];
                        yRecover[i].splice(0, 2);
                    }
                }
            }
        }

        function highlightLayer(d,i) {
            reSetYRecover();
            if (isTransitioning === false) {
                // Highlight layer
                let j = d3.select(this.parentNode).attr("id");
                layer.transition()
                    .style("opacity", function() {
                        return this.id === j? 1 : 0.2;
                    });

                // Align bottom of selected layer
                let layerRects = d3.selectAll(this.parentNode.childNodes).selectAll(".rect")._parents;
                let baseline = yRecover[i][j] + parseFloat(d3.select(this).attr("height"));
                layerRects.forEach(function(d, i) {
                    yOffset[i] = baseline - (parseFloat(d3.select(d).attr("y")) + parseFloat(d3.select(d).attr("height")));
                });
                rect.transition()
                    .attr("y", function(d, i) {
                        return parseFloat(d3.select(this).attr("y")) + yOffset[i];
                    });

                // Match y axis to bottom of layer
                y.domain([y.domain()[0] - y.invert(baseline), y.domain()[1] - y.invert(baseline) ]);
                svg.selectAll(".y.axis").transition()
                    .call(yAxis);
            }
        }

        function restoreLayer(d,i) {
            if (isTransitioning === false) {
                // Restore layer opacity
                layer.transition()
                    .style("opacity", 1);

                // Restore bar Y values
                rect.transition()
                    .attr("y", function(d, i) {
                        j = d3.select(this.parentNode).attr("id");
                        return yRecover[i][j];
                    });

                // Restore y axis
                y.domain(yRecoverDomain);
                svg.selectAll(".y.axis").transition()
                    .call(yAxis);
            }
        }
    });


}


function updateBarChart(name) {
    let barChart = d3.select('.barChartSVG');
    let males = '';
    let females = '';
    barChart.selectAll('.bar')._groups[0].forEach(obj => {
        if(d3.select(obj).attr('name') === name){
            d3.select(obj)
                .transition()
                .ease(d3.easeBounceInOut)
                .duration(100)
                .style('opacity', 1);
            if(d3.select(obj.parentNode).attr('id') === 'Males'){
                males = d3.select(obj).attr('data_value');
            }else if (d3.select(obj.parentNode).attr('id') === 'Females'){
                females = d3.select(obj).attr('data_value');
            }
        }else {
            d3.select(obj)
                .transition()
                .duration(100)
                .style('opacity', 0.3);
        }
    });
    barChart.select('.tipName')
        .text('Name:' + name );
    barChart.select('.tipMalesValue')
        .text('Males:' + males);
    barChart.select('.tipFemalesValue')
        .text('Females:' + females);
    barChart.select('.tipTotalValue')
        .text('Total:' + (parseFloat(males) + parseFloat(females)));
}