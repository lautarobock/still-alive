import Axios from 'axios';

export interface PingResponse {
    success: boolean;
    status: number;
    time?: number;
    response: any;
}

export class PingService {

    async ping(url: string): Promise<PingResponse> {
        const startedAt = new Date().getTime();
        try {
            const response = await Axios.get(url);
            const endedAt = new Date().getTime();
            return {
                response,
                status: response.status,
                time: endedAt -  startedAt,
                success: true
            };
        } catch (err) {
            return {
                response: err,
                status: err.status,
                success: false
            };
        }
    }
}