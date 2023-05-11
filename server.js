const SolrNode = require('solr-node');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// establishing the connection to the solr server
var client = new SolrNode({
  host: '127.0.0.1',
  port: '8983',
  core: 'gettingstarted',
  protocol: 'http'
});

// creating the node server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  if (pathname === '/') {
    // Serve the index.html file
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write('500 Internal Server Error');
        res.end();
        console.error(`Error serving ${filePath}: ${error}`);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(content);
        res.end();
      }
    });

  } else if (pathname === '/client.js') {
    // Serve the client.js file
    const filePath = path.join(__dirname, 'client.js');
    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write('500 Internal Server Error');
        res.end();
        console.error(`Error serving ${filePath}: ${error}`);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.write(content);
        res.end();
      }
    });

  }  else if (pathname === '/search' && req.method === 'GET') {
  // Handle the search request
  const query = querystring.parse(parsedUrl.query);
  const queryText = query.q || '';
  console.log(`Received search query: ${queryText}`);
  
  search(queryText).then((result) => {
    console.log("Responding with: " + (result[0]));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(result));
    res.end();
  }).catch((error) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.write('Error');
    res.end();
  })
}
 else {
    // Handle unknown requests
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write('404 Not Found');
    res.end();
  }
});

// Server listening for requests
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

server.on('error', (error) => {
  console.error(`Server error: ${error}`);
});

function search(input_query) {
  return new Promise((resolve, reject) => {
    const searchQuery = client.query()
      .q(input_query)
      .start(0)
      .rows(3)
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
