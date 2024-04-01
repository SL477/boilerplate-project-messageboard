'use strict';

import express from 'express';
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import cors from 'cors';
import { config } from 'dotenv';
import apiRoutes from './routes/api.js';
import fccTestingRoutes from './routes/fcctesting.js';
import runner from './test-runner.js';
import {
    hidePoweredBy,
    frameguard,
    xssFilter,
    noSniff,
    ieNoOpen,
    dnsPrefetchControl,
} from 'helmet';
config();

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //For FCC testing purposes only

app.use(json());
app.use(urlencoded({ extended: true }));

//Helmet
app.use(hidePoweredBy());
app.use(frameguard({ action: 'SAMEORIGIN' }));
app.use(xssFilter());
app.use(noSniff());
app.use(ieNoOpen());
app.use(dnsPrefetchControl());

//Sample front-end
app.route('/b/:board/').get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
});
app.route('/b/:board/:threadid').get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
});

//Index page (static HTML)
app.route('/').get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API
apiRoutes(app);

//Sample Front-end

//404 Not Found Middleware
// eslint-disable-next-line no-unused-vars
app.use(function (req, res, next) {
    res.status(404).type('text').send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on port ' + listener.address().port);
    if (process.env.NODE_ENV === 'test') {
        console.log('Running Tests...');
        setTimeout(function () {
            try {
                runner.run();
            } catch (e) {
                var error = e;
                console.log('Tests are not valid:');
                console.log(error);
            }
        }, 1500);
    }
});

export default app; //for testing
