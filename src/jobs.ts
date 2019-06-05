import { ProjectDAO, PingDAO, init, close } from "./model";
import { PingService } from "./ping.service";
import { MailService } from "./mail.service";

init()
    .then(async () => {
        try {
            const projects = await new ProjectDAO().findAll();
            const responses = await Promise.all(projects.map(proj => new PingService().ping(proj.url)));
            responses.forEach((res, idx) => console.log(`response`, projects[idx].name, res.success, res.status, res.time, res.response));
            const insertResponse = await Promise.all(responses.map((res, idx) => 
                Promise.all([
                    new PingDAO().insert(res, projects[idx]._id),
                    new ProjectDAO().updateIsAlive(projects[idx]._id, res.success)
                ])
            ));
            console.log('insertResponse', insertResponse);
            const toNotify = await new ProjectDAO().findNotAliveToNotify();
            
            await Promise.all(toNotify.map(res => new MailService().send(
                res.notifications,
                `${res.name} acaba de fallar`,
                `El proyecto ${res.name} acaba de registrar un error, es posible que este caido, por favor pongase en contacto con su administrador`
            )));
        } catch (err) {
            console.error(err);
        } finally {
            close();
        }
    })
    .catch(err => console.error('Error MONGODB', err));
