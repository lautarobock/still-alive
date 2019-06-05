import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';

export class MailService {

    private transporter: Transporter;
    private readonly user = 'still.alive.no.reply';
    private readonly pass = 'estrella713';
    private readonly from = `Still Alive <${this.user}>`;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.user,
                pass: this.pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    public send(to: string | string[], subject: string, html: string) {
        return this.transporter.sendMail({ from: this.from, to, subject, html });
    }
}