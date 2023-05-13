const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
//const searchResults = document.querySelector('#search-results');

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const queryText = searchInput.value;
  sendRequest(queryText);
});

/*var data = [
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
];*/
var data;
let relevance = 50;

function sendRequest(query) {
  const url = `http://localhost:3000/search?q=${query}`;
  var results_array = []

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((responseJSON) => {
      // console.log(`Received response from server: ${JSON.stringify(responseJSON, null, 2)}`);
      let resultCounter = 1;
      //searchResults.innerHTML = '';

      //get data and display bubbles
      data = convertJson(JSON.stringify(responseJSON));
      console.log(data)
      // var data = [
      //   {"id": 0, "name": "AngularJSAngularJSAngularJSAngularJSAngularJS", "r": 50 },
      //   {"id": 0, "name": "HTML5", "r": 40 },
      //   {"id": 0, "name": "Javascript", "r": 30 },
      //   {"id": 0, "name": "NodeJs", "r": 30 },
      //   {"id": 0, "name": "D3.js", "r": 40 },
      //   {"id": 0, "name": "CreateJS", "r": 45 },
      //   {"id": 0, "name": "Cordova", "r": 40 },
      //   {"id": 0, "name": "CSS", "r": 40 },
      //   {"id": 0, "name": "SVG", "r": 20 },
      //   {"id": 0, "name": "PHP", "r": 20 },
      //   {"id": 0, "name": "jQuery", "r": 30 },
      
      //   {"id": 1, "name": "Actionscript", "r": 50 },
      //   {"id": 1, "name": "Flash", "r": 32 },
      //   {"id": 1, "name": "Flex", "r": 50 },
      //   {"id": 1, "name": "AIR", "r": 40 },
      //   {"id": 1, "name": "Photoshop", "r": 30 },
      //   {"id": 1, "name": "Illustrator", "r": 30 },
      
      //   {"id": 2, "name": "Node Webkit", "r": 40 },
      //   {"id": 2, "name": "Chrome App", "r": 30 },
      //   {"id": 2, "name": "Cordova", "r": 45 },
      // ];
      //console.log(data);
      bubbles(data);
      relevance = 50;
      responseJSON.forEach((result) => {
        //console.log(JSON.stringify(result));
        let resultText = `result ${resultCounter++}:\n`;
     
        for (let key in result) {
          resultText += `${key}: ${JSON.stringify(result[key])}`;
          //resultText += '\n'
          
        }
        

        const resultNode = document.createElement('pre');
        resultNode.textContent = resultText;
        //searchResults.appendChild(resultNode);
      })
      
      results_array.forEach(element => {
        console.log(JSON.stringify(element));
        
      });
      
    })
    .catch((error) => {
      console.error(`Error sending request: ${error}`);
    });
    
}

//convert JSON string to dictionary
function convertJson(jsonStr) {
  let jsonData = JSON.parse(jsonStr);
  let result = jsonData.map((item, index) => {
      let keys = Object.keys(item);
      let resultItem = {};
      relevance -= 1

      keys.forEach((key) => {
          let value = item[key];
          // Since value is an array, get the first item.
          if (Array.isArray(value)) {
              resultItem[key] = value[0];
          } else {
              resultItem[key] = value;
          }

          if(key !== 'id' && key !== '_version_') {
              resultItem['relevance'] = relevance;
              resultItem['original'] = relevance;
              //relevance -= 10;
          }

          // Convert language from 'EN' to 'Eng'
          if(key === 'language' && resultItem[key] === 'EN') {
              resultItem[key] = 'Eng';
          }

          // Convert '_version_' to 'version'
          if(key === '_version_') {
              resultItem['version'] = resultItem['_version_'];
              delete resultItem['_version_'];
          }
      });
      return resultItem;
  });

  return result;
}



// BUBBLE STUFF

function bubbles(data) {
  d3.select("body").select("svg").remove();
  var width = window.innerWidth,
  height = window.innerHeight - 50;;

  var fill = d3.scale.category10(); 

  var nodes = [], labels = [],
  foci = [
    {x: width / 2, y: height / 2}
  ];  

  var svg = d3.select("body").append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("class", "mySvg"); // add class to SVG  

    var force = d3.layout.force()
      .nodes(nodes)
      .links([])
      .charge(-1000) // Increase the magnitude of negative charge for more repulsion
      .gravity(0.05) // Reduce the gravity to let the nodes spread out more
      .chargeDistance(width/2) // Set the chargeDistance to half the width of the screen
      .size([width, height])
      .on("tick", tick);  


  //var node = svg.selectAll("circle");
  var node = svg.selectAll("g");  

  var counter = 0;  

  function tick(e) {
    var k = .1 * e.alpha; 

    // Push nodes toward their designated focus.
    nodes.forEach(function(o, i) {
      o.y += (foci[0].y - o.y) * k;
      o.x += (foci[0].x - o.x) * k;
    }); 

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; }); 

  } 


  var timer = setInterval(function(){ 

    if (nodes.length > data.length-1) { clearInterval(timer); return;}  

    var item = data[counter];
    nodes.push({id: item.id, relevance: item.relevance, subject: item.subject, text: item.text, title: item.title});
    force.start();  

    node = node.data(nodes);  

    var n = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .style('cursor', 'pointer')
        .on('mousedown', function(d) {
           var sel = d3.select(this);
           sel.moveToFront();
           var infoElement = document.getElementById("bubble-info");
           var infoBox = document.getElementById("info-box");
           if (infoElement.textContent === d.text) {
            infoElement.textContent = '';
            infoBox.style.display = 'none';
        } else {
            infoElement.textContent = d.text;
            console.log(d.text);
            infoBox.style.display = 'block';
        }
        })
        .call(force.drag);  

    n.append("circle")
        .attr("r",  function(d) { return d.relevance*1.5; })
        .style("fill", function(d) { return fill(d.id); })  

    n.append("text")
        .text(function(d){
            return d.subject;
        })
        .style("font-size", function(d) {
            return Math.min(2 * d.relevance, (2 * d.relevance - 8) / this.getComputedTextLength() * 16) + "px"; 
         })
        .attr("dy", ".35em")  

    counter++;
  }, 100);  


  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };  

  function resize() {
    width = window.innerWidth;
    force.size([width, height]);
    force.start();
  } 

  d3.select(window).on('resize', resize);
  
}

