const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const startDate = document.querySelector("#start-date");
const endDate = document.querySelector("#end-date");

searchForm.addEventListener('submit', (event) => {
  console.log(startDate.value + "" + endDate.value);
  //const queryText = "";
  if (startDate.value == "" && endDate.value=="")  {
    queryText = searchInput.value;
  }else if (endDate.value != "NOW"){
    queryText = searchInput.value + " date:[" + startDate.value + "-01-01T00:00:01Z TO " + endDate.value + "-12-31T23:59:59Z]";
  }else {
    queryText = searchInput.value + " date:[" + startDate.value + "-01-01T00:00:01Z TO " + endDate.value + "]";
  }
  console.log(queryText);
  event.preventDefault();
  //const queryText = searchInput.value;
  sendRequest(queryText);
  searchInput.value = '';
});

var data;
let relevance = 50;

function sendRequest(query) {
  const url = `http://localhost:3000/search?q=${query}`;
  var results_array = [];

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((responseJSON) => {
      let resultCounter = 1;
      data = convertJson(JSON.stringify(responseJSON));
      console.log(JSON.stringify(responseJSON))
      console.log(data)
      bubbles(data);
      
      relevance = 50;
      responseJSON.forEach((result) => {
        let resultText = `result ${resultCounter++}:\n`;
        for (let key in result) {
          resultText += `${key}: ${JSON.stringify(result[key])}`;
        }
        const resultNode = document.createElement('pre');
        resultNode.textContent = resultText;
        
      });
      
      results_array.forEach(element => {
        
        console.log(JSON.stringify(element));

      });
    })
    .catch((error) => {
      console.error(`Error sending request: ${error}`);
    });
}

function convertJson(jsonStr) {
  let jsonData = JSON.parse(jsonStr);
  let result = jsonData.map((item, index) => {
    let keys = Object.keys(item);
    let resultItem = {};
    relevance -= 1.5;
    keys.forEach((key) => {
      let value = item[key];
      if (Array.isArray(value)) {
        resultItem[key] = value[0];
      } else {
        resultItem[key] = value;
      }
      if (key !== 'id' && key !== '_version_') {
        resultItem['relevance'] = relevance;
        resultItem['original'] = relevance;
      }
      if (key === 'language' && resultItem[key] === 'EN') {
        resultItem[key] = 'Eng';
      }
      if (key === '_version_') {
        resultItem['version'] = resultItem['_version_'];
        delete resultItem['_version_'];
      }
    });
    return resultItem;
  });
  return result;
}

var nodeBox = document.getElementById("nodes-box").getBoundingClientRect();
var middle_h = 1200;
var middle_w = nodeBox.width;

function bubbles(data) {
  d3.select("body").select("svg").remove();
  var width = middle_w;
  var height = middle_h;
  var nodes = [];
  var labels = [];
  var foci = [
    { x: width / 2, y: height / 2 }
  ];

  var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "mySvg") // add class to SVG
    .style("overflow", "hidden");

  var force = d3.layout.force()
    .nodes(nodes)
    .links([])
    .charge(-1000) // Increase the magnitude of negative charge for more repulsion
    .gravity(0.005) // Reduce the gravity to let the nodes spread out more
    .chargeDistance(width) // Set the chargeDistance to half the width of the screen
    .size([width, height])
    .on("tick", tick);
  var counter = 0;
  var node = svg.selectAll("g");
  
  function tick(e) {
    var k = .1 * e.alpha;
    // Push nodes toward their designated focus.
    nodes.forEach(function (o, i) {
      o.y += (foci[0].y - o.y) * k;
      o.x += (foci[0].x - o.x) * k;
      // Ensure the nodes stay within the bounds of the SVG
      o.x = Math.max(o.x, 200);
      o.y = Math.max(o.y, 250);
      o.x = Math.min(o.x, 900);
      o.y = Math.min(o.y, 825);
    });
    node.attr("transform", function (d) {
      // Ensure the nodes stay within the bounds of the SVG
      d.x = Math.max(d.x, 200);
      d.y = Math.max(d.y, 250);
      d.x = Math.min(d.x, 900);
      d.y = Math.min(d.y, 825);
      return "translate(" + d.x + "," + d.y + ")";
    });
  }
  

  var timer = setInterval(function() {
    if (nodes.length > data.length - 1) {
      clearInterval(timer);
      return;
    }
    var item = data[counter];
    nodes.push({
      id: item.id,
      relevance: item.relevance,
      subject: item.subject,
      text: item.text,
      title: item.title
    });
    force.start();
  
    node = node.data(nodes);
    var prev_title = "";
    var n = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .style('cursor', 'pointer')
      .on('mousedown', function(d) {
        var sel = d3.select(this);
        sel.moveToFront();
        var infoElement = document.getElementById("bubble-info");
        if (prev_title === d.title) {
          infoElement.textContent = "";
          prev_title = "";
        } else {
          infoElement.innerHTML = "Title: " + d.title + "<br> <br>" +
            "Subjects: " + d.subject;
          prev_title = d.title;
        }
      })
      .call(force.drag);
  
    // define the color scale with linear interpolation
    var colorScale = d3.scale.linear()
      .domain([50, 1])
      .range(["#0F0698", "#e1ebf2"]);

    // create the circles
    n.append("circle")
      .attr("r", function(d) {
        return d.relevance * 2.5;
      })
      .style("fill", function(d) {
        return colorScale(d.relevance);
      });




  
    n.append("foreignObject")
      .attr("x", function(d) {
        return -d.relevance * 2;
      })
      .attr("y", function(d) {
        return -d.relevance * 2;
      })
      .attr("width", function(d) {
        return d.relevance * 4;
      })
      .attr("height", function(d) {
        return d.relevance * 4;
      })
      .html(function(d) {
        return "<div style='width:" + (d.relevance * 4) + "px; height:" + (d.relevance * 4) + "px; text-align:center; display: flex; color: #fbf0e0; justify-content: center; align-items: center;'>" +
          "<span>" + d.title + "</span>" +
          "</div>";
      });
    counter++;
  }, 100);
  
  d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
      this.parentNode.appendChild(this);
    });
  };
  
  function resize() {
    width = window.innerWidth;
    force.size([width, height]);
    force.start();
  }
  d3.select(window).on('resize', resize);
};  