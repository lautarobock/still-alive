import * as express from 'express';
import { ProjectDAO, init, close } from './model';
import { PingService } from './ping.service';
const app = express();

init()
    .then(async () => {
        console.log('MONGODB CONECTED');
        app.listen(process.env.PORT || 3000, () => console.log('Serveer ready'));
    })
    .catch(err => console.error('Error MONGODB', err));

app.get('/', async (req, res) => {

    const projects = await new ProjectDAO().findAll();
    const responses = await Promise.all(projects.map(proj => new PingService().ping(proj.url)));
    // responses.forEach((res, idx) => console.log(`response`, projects[idx].name, res.success, res.status, res.time));

    res.send([
        '<html><body>',
        '<center><h1>Project Status</h1></center>',
        '<table style="width: 50%; margin-left: auto; margin-right: auto; margin-top: 3em;" border="1">',
            '<thead style="text-align: left;"><tr><th>Project</th><th>Status</th><th>Last Updated</th><th>Delay</th></tr></thead>',
            '<tbody>',
            responses.map((res, idx) =>
                `<tr><tr><td>${projects[idx].name}</td><td>${res.success ? 'OK' : 'FAIL'} (${res.status})</td><td>${new Date().toLocaleString()}</td><td>${res.time}ms</td></tr></tr>`
            ).join(''),
            '</tbody>',
        '</table>',
        '</body></html>'
    ].join(''));
});

process.on('exit', function () {
    console.log('About to exit, waiting for remaining connections to complete');
    close();
});

