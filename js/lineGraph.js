function generateLine() {
    var margin = {top: 30, right: 20, bottom: 70, left: 50},
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Parse the date / time
    var parseDate = d3.timeParse("%Y");

    // Set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // Define the line
    var priceline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.price); });

    // Adds the svg canvas
    var svg = d3.select(".lineGraph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.csv("data/lineData.csv", function(error, data) {
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.price = +d.price;
        });
        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) {
            return parseFloat(d.price);
        })]);

        // Nest the entries by symbol
        var dataNest = d3.nest()
            .key(function(d) {return d.symbol;})
            .entries(data);

        // set the colour scale
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        legendSpace = width/dataNest.length; // spacing for the legend

        // Loop through each symbol / key
        dataNest.forEach(function(d,i) {

            svg.append("path")
                .attr("class", "line")
                .style("stroke", function() { // Add the colours dynamically
                    return d.color = color(d.key); })
                .attr("id", 'tagLine'+d.key.replace(/\s+/g, '')) // assign an ID
                .attr("d", priceline(d.values));

            svg.selectAll("circle")
                .data(data)
                .enter().append("circle")
                .attr('class', d => 'tagDot'+d.symbol.replace(/\s+/g, ''))
                .attr("r", 3)
                .attr("cx", function(d) {
                    return x(d.date);
                })
                .attr('fill', d => color(d.symbol))
                .attr("cy", function(d) { return y(d.price); });

            // Add the Legend
            svg.append("text")
                .attr("x", (legendSpace/2)+i*legendSpace)  // space legend
                .attr("y", height + (margin.bottom/2)+ 5)
                .attr("class", "legend")    // style the legend
                .style("fill", function() { // Add the colours dynamically
                    return d.color = color(d.key); })
                .on("click", function(){
                    let line = d3.select('.lineGraph').select("#tagLine"+d.key.replace(/\s+/g, ''));
                    opacity = line.style('opacity');
                    line.transition().duration(100)
                        .style("opacity", opacity === '1' ? 0 : 1);
                    let dot = d3.select('.lineGraph').selectAll(".tagDot"+d.key.replace(/\s+/g, ''));
                    dot.transition().duration(100)
                        .style("opacity", opacity === '1' ? 0 : 1);
                })
                .text(d.key);

        });
        svg.append('text')
            .attr('class', 'clearBtn')
            .attr('stroke', '#000')
            .attr('x', width)
            .style('text-anchor', 'end')
            .style('font-size', '18px')
            .text('clear all')
            .on('click', function() {
                svg.selectAll('.line')
                    .style('opacity', 0);
                svg.selectAll('circle')
                    .style('opacity', 0)
            });

        // Add the X Axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));

    });
}