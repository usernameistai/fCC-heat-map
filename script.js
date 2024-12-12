let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
let req = new XMLHttpRequest();
let res;

const baseTemp = 8.66;
let values = [];

req.open('GET', url, true);
req.onload = () => {
  res = JSON.parse(req.response);
  values = res.monthlyVariance; // or the alternative way res['monthlyVariance']
  console.log(values, "values");

  drawCan();
  generateSc();
  drawCells();
  generateAxes();

}
req.send();

let ySc;
let xSc;
let w = 1600;
let h = 650;
let pad = 60; // changed padding from previous d3 projects as was having to introduce scaling constants for the axes to show clearly
let minY;
let maxY;
let numY;

let svg = d3.select('svg');

let drawCan = () => {
  svg.attr('width', w);
  svg.attr('height', h);
}

let generateSc = () => {

    minY = d3.min(values, item => item.year);
    maxY = d3.max(values, item => item.year);

    xSc = d3.scaleTime()
            .domain([minY, maxY + 1])
                // d3.min(values, item => item.year), d3.max(values, item => item.year + 5)
                // new Date(1753, 0, 0, 0, 0, 0, 0), new Date(2015, 0, 0, 0, 0, 0, 0) // alternative direct method usoing js Date stuff
            
            .range([pad, w - pad]); // 1.55

    ySc = d3.scaleTime()
            .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
            .range([pad, h - pad]); // 1.75
}

let drawCells = () => {

    // const temp = item => (baseTemp + item.variance).toFixed(2);

    numY = maxY - minY;

    let tooltip = d3.select('#tooltip');

    let monthsY = ["January", "February", "March", "April", "May", "June", "July",
                    "August", "September", "October", "November", "December"]

    svg.selectAll('rect')
       .data(values)
       .enter()
       .append('rect')
       .attr('class', 'cell')
       .attr('fill', item => {
            let variance = item.variance;
            if(variance < -5) {
                return 'rgb(69, 117, 180)';
            } else if (variance <= -3) {
                return 'rgb(116, 173, 209)';
            } else if (variance <= -1) {
                return 'rgb(171, 217, 233)';
            } else if (variance <= 0) {
                return 'rgb(224, 243, 248)';
            } else if (variance <= 1) {
                return 'rgb(255, 255, 191)';
            } else if (variance <= 2) {
                return 'rgb(254, 224, 144)';
            } else if (variance <= 3) {
                return 'rgb(253, 174, 97)';
            } else if (variance <= 4) {
                return 'rgb(244, 109, 67)';
            } else {
                return 'rgb(215, 48, 39)';
            }
       })
       .attr('data-year', item => item.year)
       .attr('data-month', item => item.month - 1) // so javascript months start at 0, so must subtract 1
       .attr('data-temp', item => {
        //    console.log(item.variance, "hello")
           let temp = (baseTemp + item.variance).toFixed(3);
        //    console.log(temp);
           return temp;
       })
       .attr('height', (h - (2 * pad)) / 12)
       .attr('y', item => ySc(new Date(0, (item['month'] - 1), 0, 0, 0, 0, 0)))
       .attr('width', () => (w - (2 * pad)) / numY)
       .attr('x', item => xSc(item.year))
       .on('mouseover', (event, item) => {
            tooltip.transition().style('visibility', 'visible');
            tooltip.text(item.year + ' ' + monthsY[item.month - 1] + ' ' + item.variance + ' ' + (baseTemp + item.variance).toFixed(2));
            tooltip.attr('data-year', item.year);
            tooltip.style('left', (event.pageX + 10) + 'px')
                   .style('top', (event.pageY - 28) + 'px');
       }) 
       .on('mouseout', item => tooltip.transition().style('visibility', 'hidden'));                    

}

let generateAxes = () => {
    
  let xAxis = d3.axisBottom(xSc)
                .tickFormat(d3.format('d'));
  svg.append('g') // g represents a group element
     .call(xAxis)
     .attr('id', 'x-axis')
     .attr('transform', 'translate(0, ' + (h - pad) + ')')
     .style('color', 'darkslategrey');

  let yAxis = d3.axisLeft(ySc)
                .tickFormat(d3.timeFormat('%B')); // %B show full month
  svg.append('g')
     .call(yAxis)
     .attr('id', 'y-axis')
     .attr('transform', 'translate(' + pad + ', 0)' )
     .style('color', 'darkslategrey');
}