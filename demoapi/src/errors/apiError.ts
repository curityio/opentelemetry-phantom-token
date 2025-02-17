export class ApiError extends Error {

    public readonly status: number;
    public readonly code: string;
    public readonly extra: any;
    
    public constructor(status: number, code: string, message: string, extra: any = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.extra = extra;
    }

    public toClientJson(): any {

        return {
            status: this.status,
            code: this.code,
            message: this.message,
        }
    }

    public toLogJson(): any {

        return {
            status: this.status,
            code: this.code,
            message: this.message,
            details: this.getDetails(),
        }
    }

    private getDetails(): string {

        if (this?.extra?.code && this?.extra?.message) {
            return `${this.extra.code}, ${this.extra.message}`;
        }
        else if (typeof this.extra === 'string') {
            return this.extra;
        }

        return '';
    }
}
