const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const animationContainer = d3.select("#animation-container");
const settingsButton = document.querySelector('.settings-button');
const settingsPanel = document.querySelector('.settings-panel');
const startDate = document.querySelector('#textbox1');
const endDate = document.querySelector('#textbox2');
const dropDown = document.querySelector('#myDropdown');
const langugeSelection = document.querySelector('#language_selector');
const changeViewButton = document.querySelector('#change-view-button');
let isGridView = false; // A variable to keep track of the current view
var data;

function clearTextbox(textboxId) {
  document.getElementById(textboxId).value = "";
}

//start

const voiceSearchButton = document.querySelector('#voice-search-button');
let isRecording = false;

voiceSearchButton.addEventListener('click', () => {
  if (!isRecording) {
    voiceSearchButton.style.backgroundColor = "red";
    isRecording = true;

    // Create a new SpeechRecognition object
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();

    recognition.lang = 'en-US'; // Set the language
    recognition.interimResults = false; // We want final results now
    recognition.maxAlternatives = 1; // Consider only 1 result

    recognition.start(); // Start listening

    recognition.onresult = (event) => {
      // Extract the speech as text from the event's results
      const speechText = event.results[0][0].transcript;
      searchInput.value = speechText; // Set the speech as text to the search bar

      // Reset the button state and color
      isRecording = false;
      voiceSearchButton.style.backgroundColor = "";

      recognition.stop();
    };

    recognition.onspeechend = () => {
      // Stop listening when speech ends
      recognition.stop();
      // Reset the button state and color
      isRecording = false;
      voiceSearchButton.style.backgroundColor = "";
    };

    recognition.onerror = (event) => {
      // Reset the button state and color in case of error
      isRecording = false;
      voiceSearchButton.style.backgroundColor = "";
      console.error('Error occurred in recognition: ' + event.error);
    };
  } else {
    // Reset the button state and color if we are currently recording
    isRecording = false;
    voiceSearchButton.style.backgroundColor = "";
  }
});






//end

changeViewButton.addEventListener('click', () => {
  d3.select('#animation-container').html('');
  isGridView = !isGridView;
  changeViewButton.textContent = isGridView ? 'Change to Bubble View' : 'Change to Grid View';

  if (isGridView) {
    gridView(data); // Call the grid view function when isGridView is true
  } else {
    bubbles(data); // Call the bubbles function when isGridView is false
  }
});

settingsButton.addEventListener('click', () => {
  settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
});

searchForm.addEventListener('submit', (event) => {

  console.log(startDate.value + "" + endDate.value);
  event.preventDefault();
  event.stopPropagation();

  var dropD = dropDown.value;
  var queryText = dropD;
  queryText += searchInput.value;
  if (startDate.value == "" && endDate.value=="")  {
    queryText = queryText;
  } else if (endDate.value != "NOW"){
    queryText = searchInput.value + " date:[" + startDate.value + "-01-01T00:00:01Z TO " + endDate.value + "-12-31T23:59:59Z]"; 
  } else {
    queryText = searchInput.value + " date:[" + startDate.value + "-01-01T00:00:01Z TO " + endDate.value + "]";
  }
  var lang = langugeSelection.value;
  if (lang === "any") {
    queryText = queryText;
  } else {
    queryText += (" and language:" + lang);
  }
  console.log(queryText);
  sendRequest(queryText);
});

var data;
let relevance = 50;

function sendRequest(query) {
  const url = `http://localhost:3000/search?q=${query}`;
  var results_array = [];

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(responseJSON => {
      // Do something with the responseJSON
      let resultCounter = 1;
      data = convertJson(JSON.stringify(responseJSON));
      console.log(data)
      if (isGridView) {
        gridView(data); // Call the grid view function when isGridView is true
      } else {
        bubbles(data); // Call the bubbles function when isGridView is false
      }
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
      console.log(responseJSON);
    })
    .catch(error => {
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
var middle_h = nodeBox.height;
var middle_w = nodeBox.width;

function bubbles(data) {

  d3.select("#animation-container").select("svg").remove();
  var width = middle_w;
  var height = middle_h;
  var nodes = [];
  var labels = [];
  var foci = [
    { x: width / 2, y: height / 2 }
  ];

  var svg = d3.select("#animation-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "mySvg") // add class to SVG
    .style("overflow", "hidden");


  var force = d3.layout.force()
    .nodes(nodes)
    .links([])
    .charge(-1000) // Increase the magnitude of negative charge for more repulsion
    .gravity(0.001) // Reduce the gravity to let the nodes spread out more
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
      o.y = Math.max(o.y, 0);
      o.x = Math.min(o.x, 1000);
      o.y = Math.min(o.y, 650);
    });
    node.attr("transform", function (d) {
      // Ensure the nodes stay within the bounds of the SVG
      d.x = Math.max(d.x, 200);
      d.y = Math.max(d.y, 100);
      d.x = Math.min(d.x, 900);
      d.y = Math.min(d.y, 825);
      return "translate(" + d.x + "," + d.y + ")";
    });
  }


  var timer = setInterval(function () {
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
      title: item.title,
      link: item.link,
      language: item.language,
      date: item.date
    });
    force.start();

    node = node.data(nodes);
    var prev_title = "";
    var n = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .style('cursor', 'pointer')
      .on('mousedown', function (d) {
        var sel = d3.select(this);
        sel.moveToFront();
        var infoElement = document.getElementById("bubble-info");
        if (prev_title === d.title) {
          infoElement.textContent = "";
          prev_title = "";
        } else {
          infoElement.innerHTML = "<strong>Title</strong>: " + d.title + "<br> <br>" +
          " <a href='" + d.link + "'>" + "Link to document" + "</a>" + "<br> <br>" +
            "<strong>Subjects</strong>: " + d.subject + "<br> <br>" +
            "<strong>Date:</strong> " + d.date + "<br> <br>" +
            "<strong>Text:</strong> " + d.text + "<br> <br>" + 
            "Language: " + d.language + "<br> <br>";
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
      .attr("r", function (d) {
        return d.relevance * 2.5;
      })
      .style("fill", function (d) {
        return colorScale(d.relevance);
      });

    n.append("foreignObject")
      .attr("x", function (d) {
        return -d.relevance * 2;
      })
      .attr("y", function (d) {
        return -d.relevance * 2;
      })
      .attr("width", function (d) {
        return d.relevance * 4;
      })
      .attr("height", function (d) {
        return d.relevance * 4;
      })
      .html(function (d) {
        return "<div style='width:" + (d.relevance * 4) + "px; height:" + (d.relevance * 4) + "px; text-align:center; display: flex; color: #fbf0e0; justify-content: center; align-items: center;'>" +
          "<span>" + d.title + "</span>" +
          "</div>";
      });
    counter++;
  }, 50);

  d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
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


function gridView(data) {
  d3.select("#animation-container").select("svg").remove(); // remove existing bubbles

  var gridContainer = d3.select("#animation-container")
    .append("div")
    .attr("class", "grid-view");

  var gridItems = gridContainer.selectAll(".grid-item")
    .data(data)
    .enter()
    .append("div")
    .attr("class", "grid-item")
    .on('click', function (d) {
      var infoElement = document.getElementById("bubble-info");
      infoElement.innerHTML = "<strong>Title</strong>: " + d.title + "<br> <br>" +
        " <a href='" + d.link + "'>" + "Link to document" + "</a>" + "<br> <br>" +
        "<strong>Subjects</strong>: " + d.subject + "<br> <br>" +
        "<strong>Date:</strong> " + d.date + "<br> <br>" +
        "<strong>Text:</strong> " + d.text + "<br> <br>" + 
        "Language: " + d.language + "<br> <br>";
    });

  gridItems.append("h4")
    .text(function (d) { return d.title; });

  gridItems.append("p")
    .text(function (d) { return d.subject; });

  gridItems.append("p")
    .text(function (d) { 
      var words = d.text.split(" ");
      var first50Words = words.slice(0, 50).join(" ");
      return first50Words+ "..."; 
    });
}
