
let selection = "Morgan Freeman"
// let url = `./${selection}`;
let url = "../Output/query.json"
//tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    
var formatNumber = d3.format(",d");

const t = d3.transition()
        .duration(1000);

function drawDotplot(selector,url){
    // set the dimensions and margins of the graph
    const svgWidth = 500;
    const svgHeight = 200;
    
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
        .select(selector)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    
    // Append an SVG group
    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    //Read in data
    d3.json(url).then(function(data){
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
      });
      // Configure x scale
      let x = d3.scaleLinear()
              .range([5,width])
              .domain(d3.extent(moviesReleased, d => d.released));
    
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
                    radius: (x(d.x1)-x(d.x0))
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
            .attr("r", 10)
    
      binContainerEnter.merge(binContainer)
          .attr("transform", d => `translate(${x(d.x0)}, ${height})`)
    
      // Add x axis
      svg.append("g")
      .attr("class","axis axis--x")
      .attr("transform","translate(0," + height + ")")
      .call(d3.axisBottom(x)); 
    
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
};    
function drawWordCloud(selector,url){
    d3.json(url).then(function(data){
        // Store movies object
        let movies = data[selection].movies;
        // Filter out movies with no release date
        let words = [];
        for (var i = 0; i < movies.length; i++){
            if (movies[i].genre !== null){
                words.push.apply(words, (movies[i].genre.split(', ')));
            }
            }
        // Create word frequency object to feed to draw function
        function wordFrequency(wordArray){
            var newArray = [], wordObj;
            wordArray.forEach(function (word) {
                wordObj = newArray.filter(function (w){
                return w.text == word;
                });
                if (wordObj.length) {
                wordObj[0].size += 1;
                } else {
                newArray.push({text: word, size: 1});
                }
        });
            return newArray;
        }
        let frequency = wordFrequency(words);
        var sizeScale = d3.scaleLinear()
                    .domain([0, d3.max(frequency, function(d) { return d.size} )])
                    .range([10, 50]); // 95 because 100 was causing stuff to be missing
        
        var color = d3.scaleLinear()
                .domain([0,1,2,15,20,155])
                .range(["#89334c", "#41404d",  "#9b742d", "#7d7977", "#92a19f"]);
    
        d3.layout.cloud().size([500, 200])
                .timeInterval(20)
                .words(frequency)
                .rotate(0)
                .fontSize(d => sizeScale(d.size))
                .on("end", draw)
                .start();
    
        function draw(words) {
            d3.select(selector).append("svg")
                    .attr("width", 550)
                    .attr("height", 250)
                    .attr("class", "wordcloud")
                    .append("g")
                    .attr("transform", "translate(225,100)")
                    .selectAll("text")
                    .data(words)
                    .enter().append("text")
                    .style("font-size", function(d) { return d.size + "px"; })
                    .style("fill", function(d, i) { return color(i); })
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function(d) { return d.text; });
        }
});
};

function drawBoxOffice(selector,url){
    d3.json(url).then(function(data){
    let movies = data[selection].movies;
    let actorName = selection;
    let rank = data[selection].rank;  

    let moviesReleased = [];
    for (var i = 0; i < movies.length; i++){
      if (movies[i].released !== null){
        moviesReleased.push(movies[i]);
      }
    }
    //Cast data from json file
    moviesReleased.forEach(function(d){
      d.box_office = +d.box_office
    });
    let boxOfficeTotal = 0; 
    for (var i = 0; i < moviesReleased.length; i++){
        boxOfficeTotal += moviesReleased[i].box_office; 
    } 
    console.log(boxOfficeTotal);

    // Transition box office Total
    d3.select('#box_office').append('h2')
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

    d3.select('#imdb-rank')
    .append()
    .html(` : ${rank}`);

    d3.select('#actor-name')
    .append()
    .html(` : ${actorName}`);
});
};

function drawBar(selector,url){
// Define SVG area dimensions
var svgWidth = window.innerWidth * .3;
var svgHeight = window.innerHeight * .3;

// Define the chart's margins as an object
var chartMargin = {
  top: 30,
  right: 30,
  bottom: 30,
  left: 5
};

// Define dimensions of the chart area
var width = svgWidth - chartMargin.left - chartMargin.right;
var height = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3.select(selector)
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and to the bottom
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

d3.json(url).then(function(data){
  var movies = data[selection].movies;
  var moviesToCount = [];
  moviesToCount=0;

  for (var i = 0; i<movies.length; i++){
    if (movies[i].title !== null){
      moviesToCount = moviesToCount + 1;
    }
  }
  var rectangle = chartGroup
    .append("rect")
    .attr("x", 0)
    .attr("y", 5)
    .attr("width", 100)
    .attr("height", moviesToCount)
    .attr("fill", '#89334c');

  var text = chartGroup.selectAll("text")
    .data(movies)
    .enter()
    .append("text");

  var textLabels = text
    .attr("x",30)
    .attr("y", 5)
    .text( moviesToCount)
    .attr("font-size", "20px")
    .attr("height", moviesToCount*1.25)
    .attr("fill", "#41404d");
});
};


// Let selection equal selected Actor or Actress

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("../Output/dropdown.json").then((names) => {
    names.forEach((name) => {
      selector
        .append("option")
        .text(`${name.name}_______Ranking: ${name.gender}`)
        .property("value", name.name);
    });

    drawBoxOffice('#boxoffice',url);
    drawDotplot('#dotplot',url);
    drawWordCloud('#wordcloud',url);
    drawBar('#bar-chart',url);
  });
}

function optionChanged(selection) {
  //Clear current
  d3.selectAll("svg > *").remove();
  // let url = `/${selection}`
  //Build new
  drawBoxOffice('#box_office',url);
  drawDotplot('#dotplot',url);
  drawWordCloud('#wordcloud',url);
  drawBar('#bar-chart',url);
}

// Initialize the dashboard
init();


