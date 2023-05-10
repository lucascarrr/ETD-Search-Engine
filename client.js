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
      return response.text();
    })
    .then((responseText) => {
      console.log(`Received response from server: ${responseText}`);
      searchResults.textContent = responseText;
    })
    .catch((error) => {
      console.error(`Error sending request: ${error}`);
    });
}
