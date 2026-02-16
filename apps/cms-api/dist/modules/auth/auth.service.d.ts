import { JwtService } from '@nestjs/jwt';
export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    accessToken: string;
    expiresIn: string;
}
export declare class AuthService {
    private jwtService;
    constructor(jwtService: JwtService);
    validateUser(username: string, password: string): Promise<any>;
    login(user: any): Promise<LoginResponse>;
}
