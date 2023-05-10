const SolrNode = require('solr-node');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

var client = new SolrNode({
  host: '127.0.0.1',
  port: '8983',
  core: 'gettingstarted',
  protocol: 'http'
});

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
    // Serve the main.js file
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
  } else if (pathname === '/search' && req.method === 'GET') {
    // Handle the search request
    const query = querystring.parse(parsedUrl.query);
    const queryText = query.q || '';
    console.log(`Received search query: ${queryText}`);
    // TODO: Handle the search query and send back the results
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    search(queryText).then((result) => {
      res.write(result);
      res.end();
    }).catch((error) => {
      res.write('Error');
      res.end();
    })
    
  } else {
    // Handle unknown requests
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write('404 Not Found');
    res.end();
  }
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

server.on('error', (error) => {
  console.error(`Server error: ${error}`);
});


// function search(input_query) {
//   const searchQuery = client.query()
//   .q(input_query)
//   .start(0)
//   .rows(3)
//   .addParams({
//     wt: 'json',
//     indent: true
//   })

//   client.search(searchQuery, function (err, result) {
//     if (err) {
//       console.log(err);
//       return;
//     }
  
//     const response = result.response;
//     // console.log(response);
  
//     if (response && response.docs) {
//       response.docs.forEach((doc) => {
//         console.log(doc);
//       })
//     }
//   });
// } 

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
        const docs = response.docs.map((doc) => JSON.stringify(doc));
        resolve(docs.join('\n'));
      } else {
        resolve('');
      }
    });
  });
}
