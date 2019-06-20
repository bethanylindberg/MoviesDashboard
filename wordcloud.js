// Let selection equal selected Actor or Actress
let selection = "MOrgan Freeman";
//Read in data
d3.json("query.json").then(function(data){

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
                .range([10, 95]); // 95 because 100 was causing stuff to be missing
  
    var color = d3.scaleLinear()
            .domain([0,1,2,3,4,5,6,10,15,20,155])
            .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"]);

    d3.layout.cloud().size([800, 300])
            .timeInterval(20)
            .words(frequency)
            .rotate(0)
            .fontSize(function(d) { return sizeScale(d.size); })
            .on("end", draw)
            .start();

    function draw(words) {
        d3.select("#wordcloud").append("svg")
                .attr("width", 850)
                .attr("height", 350)
                .attr("class", "wordcloud")
                .append("g")
                .attr("transform", "translate(320,200)")
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
