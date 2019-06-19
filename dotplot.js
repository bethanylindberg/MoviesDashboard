// set the dimensions and margins of the graph
const svgWidth = window.innerWidth * .75;
const svgHeight = window.innerHeight * .75;

const margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
    .select("#dotplot")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//tooltip
const tooltip = d3.select("body")
  .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  
var formatNumber = d3.format(",d");

const t = d3.transition()
      .duration(1000);
// Let selection equal selected Actor or Actress
let selection = "Morgan Freeman";
//Read in data
d3.json("query.json").then(function(data){

  // Store movies object
  let movies = data[selection].movies;
  // Filter out movies with no release date
  let moviesReleased = [];
  for (var i = 0; i < movies.length; i++){
    if (movies[i].released !== null){
      moviesReleased.push(movies[i]);
    }
  }
  //Cast data from json file
  moviesReleased.forEach(function(d){
    d.title = d.title;
    d.released = parseInt((d.released).slice(0,4));
    d.box_office = +d.box_office
  });
  // Configure x scale
  let x = d3.scaleLinear()
          .range([5,width])
          .domain(d3.extent(moviesReleased, d => d.released));
  let boxOfficeTotal = 0; 
  for (var i = 0; i < moviesReleased.length; i++){
    boxOfficeTotal += moviesReleased[i].box_office; 
  } 
  
  //number of bins for histogram unique years
  const unique = (value, index, self) => {
    return self.indexOf(value) === index;
  }
  let years = moviesReleased.map(i => i.released).filter(unique);
  let nbins = years.length;

  //histogram binning
  let histogram = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(nbins))
    .value(d => d.released);
  //binning data and filtering out empty bins
  let bins = histogram(moviesReleased).filter(d => d.length>0);

  //g container for each bin
  let binContainer = svg.selectAll(".gBin")
    .data(bins);

  binContainer.exit().remove()

  let binContainerEnter = binContainer.enter()
    .append("g")
      .attr("class", "gBin")
      .attr("transform", d => `translate(${x(d.x0)}, ${height})`)

  //populate bin containers
  binContainerEnter.selectAll("circle")
      .data(d => d.map((p, i) => {
        return {idx: i,
                title: p.title,
                released: p.released,
                type: p.type,
                credit: p.credit,
                radius: (x(d.x1)-x(d.x0))/2
              }
      }))
    .enter()
    .append("circle")
      .attr("class", "enter")
      .attr("cx", 0) //g element already at correct x pos
      .attr("cy", function(d) {
          return - d.idx * 2 * d.radius - d.radius; })
      .attr("r", 0)
      .on("mouseover", tooltipOn)
      .on("mouseout", tooltipOff)
      .transition()
        .duration(500)
        .attr("r", function(d) {
        return (d.length==0) ? 0 : d.radius; })

  binContainerEnter.merge(binContainer)
      .attr("transform", d => `translate(${x(d.x0)}, ${height})`)

  // Add x axis
  svg.append("g")
  .attr("class","axis axis--x")
  .attr("transform","translate(0," + height + ")")
  .call(d3.axisBottom(x)); 

  // Transition box office Total
  d3.select("#box_office")
  .transition()
  .duration(2500)
  .on("start", function repeat() {
    d3.active(this)
        .tween("text", function() {
          var that = d3.select(this),
              i = d3.interpolateNumber(that.text().replace(/,/g, ""), boxOfficeTotal);
          return function(t) { that.text(formatNumber(i(t))); };
        });
  });

});


function tooltipOn(d) {
  //x position of parent g element
  let gParent = d3.select(this.parentElement)
  let translateValue = gParent.attr("transform")

  let gX = translateValue.split(",")[0].split("(")[1]
  let gY = height + (+d3.select(this).attr("cy")-50)

  d3.select(this)
    .classed("selected", true)
  tooltip.transition()
       .duration(200)
       .style("opacity", .9);
  tooltip.html(`${d.title}<br/>Year Released: ${d.released}<br/>Credit: ${d.credit}<br/>Credit Type: ${d.type}`)
    .style("left", gX + "px")
    .style("top", gY + "px");
}//tooltipOn

function tooltipOff(d) {
  d3.select(this)
      .classed("selected", false);
    tooltip.transition()
         .duration(500)
         .style("opacity", 0);
}//tooltipOff