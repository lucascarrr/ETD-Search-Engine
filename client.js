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
      console.log(`Received response from server: ${JSON.stringify(responseJSON)}`);
      let resultCounter = 1;
      searchResults.innerHTML = '';
      responseJSON.forEach((result) => {
        const resultText = `result ${resultCounter++}: ${JSON.stringify(result)}`;
        const resultNode = document.createElement('div');
        resultNode.textContent = resultText;
        searchResults.appendChild(resultNode);
      });
    })
    .catch((error) => {
      console.error(`Error sending request: ${error}`);
    });
}


