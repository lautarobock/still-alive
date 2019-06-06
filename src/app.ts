import * as express from 'express';
import { ProjectDAO, init, close, PingDAO } from './model';
const app = express();

init()
    .then(async () => {
        console.log('MONGODB CONECTED');
        app.use(express.static('public'))
        app.listen(process.env.PORT || 3000, () => console.log('Serveer ready'));
    })
    .catch(err => console.error('Error MONGODB', err));

app.get('/', async (req: express.Request, res: express.Response) => {

    console.log('ROLES', (req.query.roles || '').split(','))

    const projects = await new ProjectDAO().findAll(
        req.query.roles ? req.query.roles.split(',') : []
    );
    const stats = await new PingDAO().stats();
    
    res.send([
        `<html>
        <head>
            <link rel="stylesheet" href="css/styles.css">
        </head>
        <body>`,
        '<center><h1>Project Status</h1></center>',
        '<table>',
            '<thead style="text-align: left;"><tr><th>Project</th><th>Status</th><th>Last Updated</th><th>Last Alive</th><th>Last Delay</th><th>AVG Delay</th><th>Count</th><th>Fails</th></tr></thead>',
            '<tbody>',
            projects.map((project, idx) =>{
                const stat = stats.find(s => s._id.toString() === project._id.toString()) || {} as any;
                return `<tr>
                    <tr><td>${projects[idx].name}</td>
                    <td class="${stat.success ? 'success' : 'fail'}">${stat.success ? 'OK' : 'FAIL'} (${stat.status})</td>
                    <td>${new Date(stat.timestamp).toLocaleString()}</td>
                    <td>${new Date(project.lastAlive).toLocaleString()}</td>
                    <td>${stat.time}ms</td>
                    <td>${Math.round(stat.avg)}ms</td>
                    <td>${stat.count}</td><td>${stat.fails} (${Math.round(100 * stat.fails/stat.count)}%)</td>
                </tr>`
            }).join(''),
            '</tbody>',
        '</table>',
        '</body></html>'
    ].join(''));
});

process.on('exit', function () {
    console.log('About to exit, waiting for remaining connections to complete');
    close();
});

