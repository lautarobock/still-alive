import { ProjectDAO, PingDAO, init, close } from "./model";
import { PingService } from "./ping.service";
import { MailService } from "./mail.service";

init()
    .then(async () => {
        try {
            await new JobRunner().run();
        } catch (err) {
            console.error(err);
        } finally {
            close();
        }
    })
    .catch(err => console.error('Error MONGODB', err));
export class JobRunner {

    async run() {
        await this.pingAllProjects();
        return await this.notifyAllNotAlive();
    }

    private async pingAllProjects() {
        const projects = await new ProjectDAO().findAll();
        for (let idx = 0; idx < projects.length; idx++) {
            const res = await new PingService().ping(projects[idx].url);
            console.log(`response`, projects[idx].name, res.success, res.status, res.time, res.response);
            const insertRes = await new PingDAO().insert(res, projects[idx]._id);
            console.log('insert', projects[idx].name, insertRes);
            const updateRes = await new ProjectDAO().updateIsAlive(projects[idx]._id, res.success);
            console.log('update', projects[idx].name, updateRes);
        }
    }

    private async notifyAllNotAlive() {
        const toNotify = await new ProjectDAO().findNotAliveToNotify();

        await Promise.all(toNotify.map(res => new MailService().send(
            res.notifications,
            `${res.name} acaba de fallar`,
            `El proyecto ${res.name} acaba de registrar un error, es posible que este caido, por favor pongase en contacto con su administrador`
        )));
    }
}
