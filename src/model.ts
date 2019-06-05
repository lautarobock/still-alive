import { MongoClient, Db } from 'mongodb';
import { PingResponse } from './ping.service';

const client = new MongoClient(process.env.MONGO_URL);

export function init() {
    console.log('MONGO_URL', process.env.MONGO_URL);
    return client.connect();
}

export function close() {
    console.log('Closing MONGODB');
    return client.close();
}

export interface Project {
    _id?: any;
    name: string;
    url: string;
    isAlive: boolean;
    lastAlive: Date;
    roles: string[];
    notifications: string[];
}

export class ProjectDAO {

    private db: Db;

    constructor() {
        this.db = client.db('still-alive');
    }

    findNotAliveToNotify() {
        return this.collection.find({ isAlive: { $ne: true }, 'notifications.0': { $exists: true } }).toArray();
    }

    findAll(roles?: string[]) {
        return this.collection.find(
            roles ? { roles: { $in: roles } } : {}
        ).toArray();
    }

    updateIsAlive(_id: any, isAlive: boolean) {
        const update: any = {
            isAlive
        };
        if (isAlive) {
            update.lastAlive = new Date()
        }
        return this.collection.findOneAndUpdate({ _id }, {
            $set: update
        });
    }

    private get collection() {
        return this.db.collection<Project>('projects')
    }
}

export class PingDAO {

    private db: Db;

    constructor() {
        this.db = client.db('still-alive');
    }

    insert(ping: PingResponse, _id: any) {
        return this.collection.insertOne({
            timestamp: new Date(),
            success: ping.success,
            status: ping.status,
            time: ping.time,
            project: _id
        });
    }

    stats() {
        return this.collection.aggregate<any>([
            {
                $group: {
                    _id: '$project',
                    success: { $last: '$success' },
                    status: { $last: '$status' },
                    time: { $last: '$time' },
                    timestamp: { $last: '$timestamp' },
                    count: { $sum: 1 },
                    avg: { $avg: '$time' },
                    fails: { $sum: { $cond: { if: '$success', then: 0, else: 1 } } }
                }
            }
        ]).toArray();
    }

    private get collection() {
        return this.db.collection('pings');
    }
}