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
}

export class ProjectDAO {

    private db: Db;

    constructor() {
        this.db = client.db('still-alive');
    }

    findAll() {
        return this.db.collection<Project>('projects').find().toArray();
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
                    success: {$last: '$success'},
                    status: {$last: '$status'},
                    time: {$last: '$time'},
                    timestamp: {$last: '$timestamp'},
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