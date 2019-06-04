import { MongoClient, Db } from 'mongodb';

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
    name: string;
    url: string;
}

export class ProjectDAO {

    private db: Db;

    constructor() {
        this.db = client.db('still-alive');
    }

    async findAll() {
        return this.db.collection<Project>('projects').find().toArray();
    }
}