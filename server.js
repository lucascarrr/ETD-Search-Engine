const SolrNode = require('solr-node');
const express = require('express');
const app = express();
const port = 3000;

// establishing the connection to the Solr server
var client = new SolrNode({
  host: '127.0.0.1',
  port: '8983',
  core: 'gettingstarted',
  protocol: 'http'
});

//set views
app.set('views', './views');
app.set('view engine', 'ejs');

// Serve static files from the public directory
app.use(express.static('public'));

app.get('', (req, res) => {
  res.render('index',)
})
// Route for handling search requests
app.get('/search', (req, res) => {
  console.log(`Received search query: ${req.query.q}`);
  const queryText = req.query.q;

  search(queryText).then((result) => {
    console.log("Responding with: " + (result[0]));
    console.log(JSON.stringify(result));
    res.send(result)
    
  }).catch((error) => {
    console.log("Error")
  })
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

function search(input_query) {
  return new Promise((resolve, reject) => {
    const searchQuery = client.query()
      .q(input_query)
      .start(0)
      .rows(5)
      .addParams({
        wt: 'json',
        indent: true
      })

    client.search(searchQuery, function (err, result) {
      if (err) {
        reject(err);
        return;
      }

      const response = result.response;

      if (response && response.docs) {
        const docs = response.docs.map((doc) => doc);
        resolve(docs);
      } else {
        resolve([]);
      }
    });
  });
}