import { ProjectDAO, PingDAO, init, close } from "./model";
import { PingService } from "./ping.service";

init()
    .then(async () => {
        try {
            const projects = await new ProjectDAO().findAll();
            const responses = await Promise.all(projects.map(proj => new PingService().ping(proj.url)));
            responses.forEach((res, idx) => console.log(`response`, projects[idx].name, res.success, res.status, res.time, res.response));
            const insertResponse = await Promise.all(responses.map((res, idx) => new PingDAO().insert(res, projects[idx]._id)));
            console.log('insertResponse', insertResponse);
            close();
        } catch (err) {
            console.error(err)
        }
    })
    .catch(err => console.error('Error MONGODB', err));
