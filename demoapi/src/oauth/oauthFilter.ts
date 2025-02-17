import { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, JWTVerifyGetKey, JWTVerifyOptions, jwtVerify } from 'jose';
import { Configuration } from '../configuration.js';
import { ApiError } from '../errors/apiError.js';

export class OAuthFilter {

    private readonly configuration: Configuration;
    private readonly remoteJwksSet: JWTVerifyGetKey;

    public constructor(configuration: Configuration) {

        this.configuration = configuration;
        this.remoteJwksSet = createRemoteJWKSet(new URL(configuration.jwksUri));
        this.validateAccessToken = this.validateAccessToken.bind(this);
    }

    public async validateAccessToken(request: Request, response: Response, next: NextFunction): Promise<void> {

        const accessToken = this.readAccessToken(request);
        if (!accessToken) {
            throw new ApiError(401, 'invalid_token', 'Missing, invalid or expired access token');
        }

        const options = {
            issuer: this.configuration.requiredIssuer,
            audience: this.configuration.requiredAudience,
            algorithms: [this.configuration.requiredJwtAlgorithm],
        } as JWTVerifyOptions;

        let result: any
        try {

            result = await jwtVerify(accessToken, this.remoteJwksSet, options);

        } catch (ex: any) {

            throw new ApiError(401, 'invalid_token', 'Missing, invalid or expired access token', ex);
        }

        next();
    }

    private readAccessToken(request: Request): string | null {

        const authorizationHeader = request.header('authorization');
        if (authorizationHeader) {
            const parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
                return parts[1];
            }
        }

        return null;
    }
}