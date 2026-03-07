import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../../supabase/supabase.service';
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
    private supabaseService;
    private readonly logger;
    constructor(jwtService: JwtService, supabaseService: SupabaseService);
    validateUser(usernameOrEmail: string, password: string): Promise<any>;
    login(user: any): Promise<LoginResponse>;
    getProfile(userId: number): Promise<{
        id: any;
        username: any;
        name: any;
        email: any;
        role: any;
    }>;
    updateProfile(userId: number, data: {
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
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    private ensureAdmin;
    createCmsUser(currentUserId: number, input: {
        email: string;
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
    listCmsUsers(currentUserId: number): Promise<{
        id: any;
        email: any;
        name: any;
        username: any;
        role: any;
        created_at: any;
    }[]>;
    deleteCmsUser(currentUserId: number, userIdToDelete: number): Promise<{
        success: boolean;
    }>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    private sendResetEmail;
    private sendWelcomeEmail;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
