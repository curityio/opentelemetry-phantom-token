export class Configuration {

    public port: number;
    public jwksUri: string;
    public requiredJwtAlgorithm: string;
    public requiredIssuer: string;
    public requiredAudience: string;
    public openTelemetryExporterEndpoint: string;
    public openTelemetryServiceName: string;

    public constructor() {

        this.port = parseInt(this.getValue('PORT'));
        this.jwksUri = this.getValue('JWKS_URI');
        this.requiredJwtAlgorithm = this.getValue('REQUIRED_JWT_ALGORITHM');
        this.requiredIssuer = this.getValue('REQUIRED_ISSUER');
        this.requiredAudience = this.getValue('REQUIRED_AUDIENCE');
        this.openTelemetryExporterEndpoint = this.getValue('OTEL_EXPORTER_OTLP_ENDPOINT');
        this.openTelemetryServiceName = this.getValue('OTEL_SERVICE_NAME');
    }

    private getValue(name: string): string {
        
        const value = process.env[name];
        if (!value) {
            throw new Error(`The environment variable ${name} has not been set`)
        }

        return value!;
    }
}
