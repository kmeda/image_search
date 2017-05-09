var express = require('express');
var app = express();
app.use(express.static(__dirname + "/public"));
app.set('view-engine', 'html');

var imageSearch = require('google-images');
var API_key = 'AIzaSyCuG8kVtCb5M_m0Ruz_VZMOyBdn-AlzcYw';
var cseID = '016245174269635204992:i6kgmq8fmgc';
var client = new imageSearch(cseID, API_key);

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.Promise = global.Promise;
var connection = mongoose.createConnection('mongodb://admin:admin@ds133251.mlab.com:33251/imagesearch003', (err)=>{
  if (err) {
    console.log(err);
  }
  console.log("Connected to remote database.");
});

var searchQuerySchema = new Schema({
  term: String,
  when: { type: Date, default: Date.now }
});
var searchTerm = connection.model('searchTerm', searchQuerySchema);


app.get('/', (req, res)=>{
    res.send('index');
});

app.get('/api/latest/imagesearch/', (req, res)=>{

  searchTerm.find({}).then((results)=>{

    var search=[];
    results.map((result)=>{
      search.push({term: result.term, when : result.when})
    });
    res.json(search);

  }).catch((e)=> console.log(e));
});

app.get('/api/imagesearch/:searchQuery', (req, res)=>{

  var searchQuery = req.params.searchQuery;
  var page = req.query.offset ? req.query.offset : 1;

  client.search(searchQuery, {page:page}).then((results)=>{
    if (results.length > 0) {
      var searchQueries = new searchTerm({term: searchQuery ,timestamp: new Date().toISOString()});
      searchQueries.save().then(()=>{
        return console.log("Search Query Saved.");
      }).catch((e)=>console.log(e));

      res.json({results});
    }
    else {
      res.send({error: "Couldn't fetch data."});
    }
  }).catch((e)=> console.log(e));

//How to fetch results using this query and apply pagination

});

app.listen(3000, (err)=>{
  if (err) {
    console.log(err);
  }
  console.log("Started server on port 3000..");
});
//mongodb://<dbuser>:<dbpassword>@ds133251.mlab.com:33251/imagesearch003


//Client ID:
//
// 6da48b36151b33e
// Client secret:
//
// 5e2adfd9771fb580d97e78c4d09863b6a65374cc
