var path = require('path');
var express = require('express');
var webpack = require('webpack');

var config = require('./webpack.config');

var bodyParser = require('body-parser');
var app = express();
var compiler = webpack(config);

var publicPath = path.join(__dirname, 'public');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
}));

app.use(express.static(publicPath));

app.post('/WorkflowAjaxService.asmx/GetContainerMeta', (req, res) => {
    var nodes = [];
    
    var tags = JSON.parse(req.body.tagStore);
    if (tags.lookup != null) {
        nodes = lookups[tags.lookup];
    } else if (tags.workflow != null) {
        nodes = workflows[tags.lookup];
    }
    
    var randomBetween = (first, last) => Math.floor(Math.random() * last) + first;
    
    setTimeout(_ => {
        res.json(nodes);
    }, randomBetween(200, 500));
});

app.use(require('webpack-hot-middleware')(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
}));

app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(3000, 'localhost', err => {
    if (err) {
        console.log(err);
        return;
    }

    console.log('Listening at http://localhost:3000');
});

var lookups = {
    55: [{
        id: '1',
        text: 'Workflow 1',
        containerType: 2,
        type: 'lookup',
        tags: {
            lookup: 55
        }
    }, {
        id: '2',
        text: 'Workflow 2',
        containerType: 2,
        type: 'lookup',
        tags: {
            lookup: 55
        }
    }, {
        id: '3',
        text: 'Workflow 3',
        containerType: 2,
        type: 'lookup',
        tags: {
            lookup: 55
        }
    }],
    50: [{
        id: '1',
        text: 'Corki',
        containerType: 2,
        type: 'lookup',
        tags: {
            lookup: 50
        }
    }, {
        id: '2',
        text: 'Zilean',
        containerType: 2,
        type: 'lookup',
        tags: {
            lookup: 50
        }
    }, {
        id: '3',
        text: 'Lee Sin',
        containerType: 2,
        type: 'lookup',
        tags: {
            lookup: 50
        }
    }]
};

var workflows = {
    1: [{
        id: 'reservedvarchar01',
        text: 'WF1 Text Field',
        containerType: 2,
        type: 'text'
    }],
    2: [{
        id: 'reservedvarchar01',
        text: 'WF2 Text Field',
        containerType: 2,
        type: 'text'
    }],
    3: [{
        id: 'reservedvarchar01',
        text: 'WF3 Text Field',
        containerType: 2,
        type: 'text'
    }]
};