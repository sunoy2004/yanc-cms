import { AuthService, LoginRequest, LoginResponse } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginRequest: LoginRequest): Promise<LoginResponse>;
}
