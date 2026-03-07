import { AuthService, LoginRequest, LoginResponse } from './auth.service';
import type { Request } from 'express';
export declare class AuthController {
    private authService;
    private readonly logger;
    constructor(authService: AuthService);
    login(loginRequest: LoginRequest): Promise<LoginResponse>;
    getMe(req: Request): Promise<{
        id: any;
        username: any;
        name: any;
        email: any;
        role: any;
    }>;
    updateMe(req: Request, body: {
        name?: string;
        email?: string;
        username?: string;
    }): Promise<{
        id: any;
        username: any;
        name: any;
        email: any;
        role: any;
    }>;
    changePassword(req: Request, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
    }>;
    createUser(req: Request, body: {
        email?: string;
        name?: string;
        username?: string;
    }): Promise<{
        id: number;
        email: string;
        name: string | null;
        username: string;
        role: string;
        initialPassword: string;
    }>;
    listUsers(req: Request): Promise<{
        id: any;
        email: any;
        name: any;
        username: any;
        role: any;
        created_at: any;
    }[]>;
    deleteUser(req: Request, body: {
        userId?: number;
    }): Promise<{
        success: boolean;
    }>;
    forgotPassword(body: {
        email?: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        token?: string;
        newPassword?: string;
    }): Promise<{
        message: string;
    }>;
}
