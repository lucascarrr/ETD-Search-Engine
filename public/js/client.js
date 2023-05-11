const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const searchResults = document.querySelector('#search-results');

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const queryText = searchInput.value;
  sendRequest(queryText);
});

function sendRequest(query) {
  const url = `http://localhost:3000/search?q=${query}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((responseJSON) => {
      console.log(`Received response from server: ${JSON.stringify(responseJSON, null, 2)}`);
      let resultCounter = 1;
      searchResults.innerHTML = '';
      responseJSON.forEach((result) => {
        let resultText = `result ${resultCounter++}:\n`;
        for (let key in result) {
          resultText += `${key}: ${JSON.stringify(result[key])}`;
          resultText += '\n'
        }
        const resultNode = document.createElement('pre');
        resultNode.textContent = resultText;
        searchResults.appendChild(resultNode);
      });
    })
    .catch((error) => {
      console.error(`Error sending request: ${error}`);
    });
}

// BUBBLE STUFF
var data = [
  { name: " 1", relevance: 90, original: 90, info: "Info 1" },
  { name: " 2", relevance: 70, original: 70, info: "Info 2" },
  { name: " 3", relevance: 85, original: 85, info: "Info 3" },
  { name: " 4", relevance: 60, original: 60, info: "Info 4" },
  { name: " 5", relevance: 95, original: 95, info: "Info 5" },
  { name: " 6", relevance: 120, original: 120, info: "Info 6" },
  { name: " 7", relevance: 50, original: 50, info: "Info 7" },
  { name: " 8", relevance: 110, original: 110, info: "Info 8" },
  { name: " 9", relevance: 80, original: 80, info: "Info 9" },
  { name: " 10", relevance: 40, original: 40, info: "Info 10" }
];

var svg = d3.select("#searchVis").append("svg")
  .attr("width", 1600)
  .attr("height", 800);

var colorScale = d3.scaleSequential().domain([0, 120]).interpolator(d3.interpolateBlues);

var simulation = d3.forceSimulation(data)
  .force("charge", d3.forceManyBody().strength(500))
  .force("center", d3.forceCenter(400, 400))
  .force("collision", d3.forceCollide().radius(function (d) {
      return d.relevance + 10;
  }))
  .alphaDecay(0.05) // Add this line to set a lower alpha decay rate
  .on("tick", ticked);


var node = svg.selectAll(".node")
  .data(data)
  .enter().append("g")
  .attr("class", "node");

var circles = node.append("circle")
  .attr("r", function (d) { return d.relevance; })
  .attr("class", "bubble")
  .attr("fill", function (d) { return colorScale(d.relevance); })
  .on("mouseover", function (d) {
      d.relevance *= 1.2;
      d3.select(this).attr("r", d.relevance);
      simulation.force("collision", d3.forceCollide().radius(function (d) { return d.relevance + 10; }));
      simulation.alpha(1).restart();
  })
  .on("mouseout", function (d) {
      d.relevance = d.original;
      d3.select(this).attr("r", d.relevance);
      simulation.force("collision", d3.forceCollide().radius(function (d) { return d.relevance + 10; }));
      simulation.alpha(1).restart();
  })
  .on("click", function (d) {
      var parent = d3.select(this.parentNode);
      parent.classed("flipped", !parent.classed("flipped"));
  });

var nameLabels = node.append("text")
  .attr("class", "name")
  .text(function (d) { return d.name; })
  .attr("x", function (d) { return -d.relevance / 3; })
  .attr("y", function (d) { return d.relevance / 4; })
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "middle")
  .style("font-size", function (d) { return d.relevance / 3 + "px"; })
  .style("fill", "white");


var infoLabels = node.append("text")
  .attr("class", "info")
  .text(function (d) { return d.info; })
  .attr("x", function (d) { return -d.relevance / 3; })
  .attr("y", function (d) { return d.relevance / 4; })
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "middle")
  .style("font-size", function (d) { return d.relevance / 3 + "px"; })
  .style("display", "none")
  .style("fill", "white");


var toggleButton = d3.select("#toggleButton");
var isGrid = false;

toggleButton.on("click", function () {
  isGrid = !isGrid;
  updateView();
});

function updateView() {
  if (isGrid) {
      svg.attr("height", 200);
      node.attr("transform", function (d, i) {
          var x = (i % 5) * 160 + 80;
          var y = Math.floor(i / 5) * 160 + 80;
          return "translate(" + x + "," + y + ")";
      });
      nameLabels.style("display", "block");
      infoLabels.style("display", "block");
      circles.style("display", "none");
  } else {
      svg.attr("height", 800);
      node.attr("transform", null);
      nameLabels.style("display", null);
      infoLabels.style("display", null);
      circles.style("display", "block");
  }
}

function ticked() {
  if (!isGrid) {
      circles
          .attr("cx", function (d) { return d.x = Math.max(d.relevance, Math.min(800 - d.relevance, d.x)); })
          .attr("cy", function (d) { return d.y = Math.max(d.relevance, Math.min(800 - d.relevance, d.y)); });
  }
  nameLabels.attr("x", function (d) { return d.x; })
      .attr("y", function (d) { return d.y; });

  infoLabels
      .attr("x", function (d) { return d.x; })
      .attr("y", function (d) { return d.y; });
}

updateView();
