
function drawBarChart() {
    let margin = {top: 90, right: 20, bottom: 500, left: 100};
    let container = d3.select('.barChart')
        .append('svg')
        .attr('width', 900)
        .attr('height', 1000);
    let width = +container.attr("width") - margin.left - margin.right;
    let height = +container.attr("height") - margin.top - margin.bottom;
    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    let y = d3.scaleLinear().rangeRound([height, 0]);
    container.append('g')
        .attr('class', 'tip')
        .append('text')
        .attr('class', 'tipName')
        .attr('stroke', '#000')
        .attr('x', width + margin.right + margin.left)
        .attr('y', 50)
        .style('text-anchor', 'end')
        .text('');
    container.select('.tip')
        .append('text')
        .attr('class', 'tipValue')
        .attr('stroke', '#000')
        .attr('x', width + margin.right + margin.left)
        .attr('y', 75)
        .style('text-anchor', 'end')
        .text('');
    d3.csv('data/data1.csv').then(function(data) {
        let compare = function (prop) {
            return function (obj1, obj2) {
                let val1 = obj1[prop];
                let val2 = obj2[prop];
                if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
                    val1 = Number(val1);
                    val2 = Number(val2);
                }
                if (val1 < val2) {
                    return 1;
                } else if (val1 > val2) {
                    return -1;
                } else {
                    return 0;
                }
            }
        };
        data = data.sort(compare("Total"));
        x.domain(data.map(d => d.Description));
        y.domain([0, d3.max(data, d => parseFloat(d.Total))]);
        let g = container.append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-55)");

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y));

        let rect = g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("name", d => d.Description)
            .attr("x", d => x(d.Description))
            .attr("y", height)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .transition()
            .delay((d, i) => i * 100)
            .attr("y", d => y(d.Total))
            .attr("height", d => height - y(d.Total));

        g.selectAll(".text")
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'text')
            .attr('name', d => d.Description)
            .attr('x', d => x(d.Description))
            .attr('y', d => y(d.Total))
            .attr('width', x.bandwidth())
            .attr('stroke', '#000')
            .style('opacity', 0)
            .text(d => d.Total);
    })
}

function focusBar(name) {
    let barChart = d3.select('.barChart');
    let value = 0;
    barChart.selectAll('.bar')._groups[0].forEach(obj => {
        if(d3.select(obj).attr('name') !== name) {
            d3.select(obj)
                .transition()
                .ease(d3.easeLinear)
                .duration(1000)
                .style('fill', '#9d9d9d')
        }else {
            d3.select(obj)
                .transition()
                .ease(d3.easeElasticInOut)
                .duration(1000)
                .style('fill', 'steelblue')
        }
    });
    barChart.selectAll('.text')._groups[0].forEach(obj => {
        if(d3.select(obj).attr('name') === name) {
            value = d3.select(obj).html();
        }
    });
    barChart.select('.tipName')
        .text('name:' + name );
    barChart.select('.tipValue')
        .text('value:' + value);
}