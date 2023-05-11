var array = [  "Bubble 1", "Bubble 2", "Bubble 3", "Bubble 4", "Bubble 5",   "Bubble 6", "Bubble 7", "Bubble 8", "Bubble 9", "Bubble 10",   "Bubble 11", "Bubble 12", "Bubble 13", "Bubble 14", "Bubble 15",   "Bubble 16", "Bubble 17", "Bubble 18", "Bubble 19", "Bubble 20",   "Bubble 21", "Bubble 22", "Bubble 23", "Bubble 24", "Bubble 25",   "Bubble 26", "Bubble 27", "Bubble 28", "Bubble 29", "Bubble 30",   "Bubble 31", "Bubble 32", "Bubble 33", "Bubble 34", "Bubble 35",   "Bubble 36", "Bubble 37", "Bubble 38", "Bubble 39", "Bubble 40",   "Bubble 41", "Bubble 42", "Bubble 43", "Bubble 44", "Bubble 45",   "Bubble 46", "Bubble 47", "Bubble 48", "Bubble 49", "Bubble 50"];

var bubbleContainer = document.getElementById("bubble-container");

var angle = 2 * Math.PI / (array.length - 1);
var greenRadius = 100;
var orangeRadius = 200;
var redRadius = 300;

for (var i = 0; i < array.length; i++) {
    var bubble = document.createElement("div");
    bubble.classList.add("bubble");
  
    if (i < 4) {
      bubble.classList.add("green");
    } else if (i < 9) {
      bubble.classList.add("orange");
    } else {
      bubble.classList.add("red");
    }
  
    bubble.textContent = array[i];
  
    bubble.addEventListener("mouseover", function() {
      bubbleContainer.appendChild(this);
      this.classList.add("enlarge");
    });
  
    bubble.addEventListener("mouseout", function() {
      this.classList.remove("enlarge");
    });
  
    var x, y;
    
    if (i < 4) {
      // Arrange green bubbles around the center
      x = window.innerWidth / 2 - (4 - i) * 80;
      y = window.innerHeight / 2 - 80;
    } else if (i < 9) {
      // Arrange orange bubbles around the green bubbles
      var offset = i - 4;
      var angle = offset * (Math.PI / 4);
      x = window.innerWidth / 2 + Math.cos(angle) * 200;
      y = window.innerHeight / 2 + Math.sin(angle) * 200;
    } else {
      // Arrange red bubbles around the orange bubbles
      var offset = i - 9;
      var angle = offset * (Math.PI / 8);
      x = window.innerWidth / 2 + Math.cos(angle) * 400;
      y = window.innerHeight / 2 + Math.sin(angle) * 400;
    }
    
    // Check if the bubble overlaps with any other bubbles
    var overlapping = true;
    while (overlapping) {
      overlapping = false;
      for (var j = 0; j < i; j++) {
        var otherBubble = bubbleContainer.children[j];
        var dx = x - parseInt(otherBubble.style.left);
        var dy = y - parseInt(otherBubble.style.top);
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          // Bubbles overlap, so we need to move this one
          overlapping = true;
          if (i < 9) {
            // Move the orange bubbles outward
            x += Math.cos(angle + Math.PI / 2) * 10;
            y += Math.sin(angle + Math.PI / 2) * 10;
          } else {
            // Move the red bubbles outward
            x += Math.cos(angle + Math.PI / 2) * 20;
            y += Math.sin(angle + Math.PI / 2) * 20;
          }
          break;
        }
      }
    }
    
    bubble.style.left = x + "px";
    bubble.style.top = y + "px";
  
    bubbleContainer.appendChild(bubble);
  }
  
  document.addEventListener("mousemove", function(event) {
    var mouseX = event.clientX;
    var mouseY = event.clientY;
  
    var halfWidth = window.innerWidth / 2;
    var halfHeight = window.innerHeight / 2;
  
    var dx = (mouseX - halfWidth) / halfWidth;
    var dy = (mouseY - halfHeight) / halfHeight;
  
    bubbleContainer.style.transform = "translate(" + dx * 50 + "px, " + dy * 50 + "px)";
  });