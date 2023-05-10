const http = require('http');
const fs = require('fs');
const SolrNode = require('solr-node');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.write('Error loading index.html');
        res.end();
      } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      }
    });
  } else if (req.url === '/search') {
    var client = new SolrNode({
      host: '127.0.0.1',
      port: '8983',
      core: 'gettingstarted',
      protocol: 'http'
    });

    const authorQuery = {
      subject: 'australia'
    };

    const searchQuery = client.query()
      .q(authorQuery)
      .addParams({
        wt: 'json',
        indent: true
      });

    client.search(searchQuery, function (err, result) {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.write('Error searching Solr');
        res.end();
      } else {
        const response = result.response;
        if (response && response.docs) {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.write(JSON.stringify(response.docs));
          res.end();
        } else {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.write(JSON.stringify([]));
          res.end();
        }
      }
    });
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('Page not found');
    res.end();
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
