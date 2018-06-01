function generatePacking() {
    d3.json('data/packData.json', function(data) {
        var data = data.data;
        var color = d3.scaleOrdinal().range(["#1E90FF","#FF6347"]),
            diameter = 800;

        var bubble = d3.pack()
                .size([diameter, diameter])
                .padding(1.5),
            root = d3.hierarchy({children: data})
                .sum(function(d) { return d.children ? 0 : d3.sum(d[1]); }),
            arc = d3.arc().innerRadius(0),
            pie = d3.pie();

        var nodeData = bubble(root).children;

        var svg = d3.select(".packing").append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");

        var nodes = svg.selectAll("g.node")
            .data(nodeData);

        var nodeEnter = nodes.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .on('click', function() {
                let opacity = d3.select(this).select('.label').style('opacity');
                d3.select(this).select('.label').style('opacity', opacity === "1" ? 0 : 1);
            });

        var arcGs = nodeEnter.selectAll("g.arc")
            .data(function(d) {
                return pie(d.data[1]).map(function(m) { m.r = d.r; return m; });
            });
        var arcEnter = arcGs.enter().append("g").attr("class", "arc");

        arcEnter.append("path")
            .attr("d", function(d) {
                arc.outerRadius(d.r);
                return arc(d);
            })
            .style("fill", function(d, i) { return color(i); });

        arcEnter.append("text")
            .attr('x', function(d) { arc.outerRadius(d.r); return arc.centroid(d)[0]; })
            .attr('y', function(d) { arc.outerRadius(d.r); return arc.centroid(d)[1]; })
            .attr('dy', "0.35em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.value; });

        var labels = nodeEnter.selectAll("text.label")
            .data(function(d) { return [d.data[0]]; });
        labels.enter().append("text")
            .attr('class', 'label')
            .attr('dy', '1.5em')
            .style('font-size', '16px')
            .style("text-anchor", "middle")
            .style('opacity', 0)
            .text(String);
    })
}