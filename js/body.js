function generateBody() {
    d3.select('.body')
        .append('svg')
        .attr('class', 'bodySVG')
        .attr('width', 300)
        .attr('height', 1000);

    d3.select('.bodySVG')
        .append('rect')
        .attr('x', 20)
        .attr('y', 50)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', '#FF6347');
    d3.select('.bodySVG')
        .append('rect')
        .attr('x', 20)
        .attr('y', 120)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', "#1E90FF");
    d3.select('.bodySVG')
        .append('text')
        .attr('x', 50)
        .attr('y', 50)
        .attr('stroke', '#000')
        .style('dominant-baseline', 'hanging')
        .style('font-size', '18px')
        .text('Females');
    d3.select('.bodySVG')
        .append('text')
        .attr('x', 50)
        .attr('y', 120)
        .attr('stroke', '#000')
        .style('dominant-baseline', 'hanging')
        .style('font-size', '18px')
        .text('Males');


    d3.select('.bodySVG')
        .append('image')
        .attr('x', 50)
        .attr('y', 200)
        .attr('width', 200)
        .attr('xlink:href', './image/body.jpg');

    d3.json('data/diseases.json', function(data){
        data.forEach(function(obj) {
            d3.select('.bodySVG')
                .append('polyline')
                .attr('name', obj.name)
                .attr('fill', 'transparent')
                .attr('stroke', '#000')
                .attr('stroke-width', 1)
                .attr('points', obj.points)
                .style('opacity', 0);
            d3.select('.bodySVG')
                .append('text')
                .attr('name', obj.name)
                .attr('stroke', '#000')
                .attr('x', () => {
                    if(obj.points !== undefined) {
                        return obj.points.split(',')[4];
                    }
                    else{
                        return 50;
                    }
                })
                .attr('y', () => {
                    if(obj.points !== undefined) {
                        return obj.points.split(',')[5];
                    }
                    else{
                        return 50;
                    }
                })
                .style('text-anchor', () => {
                    if(obj.points !== undefined && obj.points.split(',')[4] === '60') {
                        return 'end'
                    }
                    else{
                        return 'start';
                    }
                })
                .style('opacity', 0)
                .text(obj.value);
        })
    });
}

function updateBody(name){
    let barChart = d3.select('.bodySVG');
    let males = '';
    let females = '';
    barChart.selectAll('text')._groups[0].forEach(obj => {
        if(d3.select(obj).attr('name') === name){
            d3.select(obj)
                .transition()
                .ease(d3.easeBounceInOut)
                .duration(100)
                .style('opacity', 1);
        }else {
            d3.select(obj)
                .transition()
                .duration(100)
                .style('opacity', 0);
        }
    });
    barChart.selectAll('polyline')._groups[0].forEach(obj => {
        if(d3.select(obj).attr('name') === name){
            d3.select(obj)
                .transition()
                .ease(d3.easeBounceInOut)
                .duration(100)
                .style('opacity', 1);
        }else {
            d3.select(obj)
                .transition()
                .duration(100)
                .style('opacity', 0);
        }
    });
}