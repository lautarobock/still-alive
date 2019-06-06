import * as express from 'express';
import * as exphbs from 'express-handlebars';
import { ProjectDAO, init, close, PingDAO } from './model';
const app = express();

init()
    .then(async () => {
        console.log('MONGODB CONECTED');
        app.engine('handlebars', exphbs());
        app.set('view engine', 'handlebars');
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
    projects.forEach(project => {
        const stat = stats.find(s => s._id.toString() === project._id.toString()) || {} as any;
        (project as any).stat = stat;
    });
    res.render('index', {
        projects,
        helpers: {
            date: date => new Date(date).toLocaleString(),
            round: number => Math.round(number),
            percent: (amount, total) => Math.round(100 * amount / total),
            isAlive: isAlive => isAlive ? 'OK' : 'FAIL',
            isAliveClass: isAlive => isAlive ? 'success' : 'fail'
        }
    });
});

process.on('exit', function () {
    console.log('About to exit, waiting for remaining connections to complete');
    close();
});

