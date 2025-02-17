import { Request, Response } from 'express';

export class ApiController {

    public constructor() {
        this.getData = this.getData.bind(this);
    }

    public async getData(request: Request, response: Response): Promise<void> {

        const data = {
            message: 'Success response from API',
        };

        await this.delay();

        response.setHeader('Content-Type', 'application/json');
        response.status(200).send(JSON.stringify(data));

    }

    private async delay(): Promise<void> {
        
        const milliSeconds = Math.random() * 1000;
        return new Promise(resolve => {
            setTimeout(resolve, milliSeconds);
        });
    }
}
