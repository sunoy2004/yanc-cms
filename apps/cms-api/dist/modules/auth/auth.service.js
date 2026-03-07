"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
const nodemailer = __importStar(require("nodemailer"));
const supabase_service_1 = require("../../supabase/supabase.service");
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;
let AuthService = AuthService_1 = class AuthService {
    constructor(jwtService, supabaseService) {
        this.jwtService = jwtService;
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async validateUser(usernameOrEmail, password) {
        const client = this.supabaseService.getClient();
        const identifier = (usernameOrEmail || '').trim();
        if (client && identifier) {
            try {
                let { data, error } = await client
                    .from('users')
                    .select('id, username, password_hash, role, email')
                    .eq('username', identifier)
                    .limit(1)
                    .maybeSingle();
                if (!data) {
                    const emailIdentifier = identifier.toLowerCase();
                    const result = await client
                        .from('users')
                        .select('id, username, password_hash, role, email')
                        .eq('email', emailIdentifier)
                        .limit(1)
                        .maybeSingle();
                    data = result.data;
                    error = result.error;
                }
                if (error) {
                    this.logger.error('Supabase error fetching user:', error);
                }
                if (data) {
                    const match = await bcrypt.compare(password || '', data.password_hash || '');
                    if (match) {
                        return {
                            userId: data.id,
                            username: data.username,
                            role: data.role || 'admin',
                        };
                    }
                    return null;
                }
            }
            catch (err) {
                this.logger.error('Error validating user via Supabase:', err);
            }
        }
        const validUsername = 'admin';
        const validPassword = 'yanc-cms-admin';
        if (identifier === validUsername || identifier === 'admin@yanc.in') {
            if (password === validPassword) {
                return { userId: 1, username: validUsername, role: 'admin' };
            }
        }
        return null;
    }
    async login(user) {
        const payload = { username: user.username, sub: user.userId, role: user.role || 'admin' };
        return {
            accessToken: this.jwtService.sign(payload),
            expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        };
    }
    async getProfile(userId) {
        const client = this.supabaseService.getClient();
        if (client) {
            const { data, error } = await client
                .from('users')
                .select('id, username, name, email, role')
                .eq('id', userId)
                .maybeSingle();
            if (error) {
                this.logger.error('Supabase getProfile error:', error);
            }
            if (data)
                return data;
        }
        return {
            id: userId,
            username: 'admin',
            name: 'Admin User',
            email: 'admin@yanc.in',
            role: 'admin',
        };
    }
    async updateProfile(userId, data) {
        const client = this.supabaseService.getClient();
        if (client) {
            const updatePayload = {};
            if (typeof data.name === 'string') {
                updatePayload.name = data.name;
            }
            if (typeof data.email === 'string') {
                updatePayload.email = data.email;
            }
            if (typeof data.username === 'string' && data.username.trim() !== '') {
                const newUsername = data.username.trim();
                const { data: existing, error: usernameErr } = await client
                    .from('users')
                    .select('id')
                    .eq('username', newUsername)
                    .maybeSingle();
                if (usernameErr) {
                    this.logger.error('Supabase updateProfile username check error:', usernameErr);
                    throw new Error('Failed to update profile');
                }
                if (existing && existing.id !== userId) {
                    throw new Error('Username is already taken');
                }
                updatePayload.username = newUsername;
            }
            const { error } = await client.from('users').update(updatePayload).eq('id', userId);
            if (error) {
                this.logger.error('Supabase updateProfile error:', error);
                throw new Error('Failed to update profile');
            }
            return this.getProfile(userId);
        }
        return { id: userId, username: data.username || 'admin', name: data.name, email: data.email, role: 'admin' };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const client = this.supabaseService.getClient();
        if (client) {
            const { data, error } = await client.from('users').select('password_hash').eq('id', userId).maybeSingle();
            if (error) {
                this.logger.error('Supabase changePassword select error:', error);
                throw new Error('Failed to change password');
            }
            const existingHash = data?.password_hash || '';
            const match = await bcrypt.compare(currentPassword, existingHash);
            if (!match) {
                throw new Error('Current password is incorrect');
            }
            const newHash = await bcrypt.hash(newPassword, 10);
            const { error: updateError } = await client.from('users').update({ password_hash: newHash }).eq('id', userId);
            if (updateError) {
                this.logger.error('Supabase changePassword update error:', updateError);
                throw new Error('Failed to change password');
            }
            return { success: true };
        }
        throw new Error('Change password not supported without Supabase configured');
    }
    async ensureAdmin(userId) {
        const client = this.supabaseService.getClient();
        if (!client) {
            throw new common_1.ForbiddenException('Admin operations require Supabase');
        }
        const { data, error } = await client.from('users').select('role').eq('id', userId).maybeSingle();
        if (error) {
            this.logger.error('Supabase ensureAdmin error:', error);
            throw new common_1.ForbiddenException('Unable to verify admin privileges');
        }
        const role = data?.role || 'editor';
        if (role !== 'admin') {
            throw new common_1.ForbiddenException('Only admin can perform this action');
        }
    }
    async createCmsUser(currentUserId, input) {
        const client = this.supabaseService.getClient();
        if (!client) {
            throw new Error('User management requires Supabase');
        }
        await this.ensureAdmin(currentUserId);
        const rawEmail = (input.email || '').trim().toLowerCase();
        if (!rawEmail || !rawEmail.includes('@')) {
            throw new Error('A valid email is required');
        }
        const { data: existingByEmail, error: emailErr } = await client
            .from('users')
            .select('id')
            .eq('email', rawEmail)
            .maybeSingle();
        if (emailErr) {
            this.logger.error('Supabase createCmsUser email check error:', emailErr);
            throw new Error('Failed to create user');
        }
        if (existingByEmail) {
            throw new Error('A user with this email already exists');
        }
        let baseUsername = (input.username || rawEmail.split('@')[0] || 'user').toLowerCase();
        baseUsername = baseUsername.replace(/[^a-z0-9._-]/g, '');
        if (!baseUsername)
            baseUsername = 'user';
        let finalUsername = baseUsername;
        let suffix = 1;
        while (true) {
            const { data: existingUser, error: userErr } = await client
                .from('users')
                .select('id')
                .eq('username', finalUsername)
                .maybeSingle();
            if (userErr) {
                this.logger.error('Supabase createCmsUser username check error:', userErr);
                throw new Error('Failed to create user');
            }
            if (!existingUser)
                break;
            finalUsername = `${baseUsername}${suffix}`;
            suffix += 1;
        }
        const initialPassword = crypto.randomBytes(12).toString('base64url').slice(0, 12);
        const passwordHash = await bcrypt.hash(initialPassword, 10);
        const name = (input.name || '').trim() || null;
        const { data: created, error: insertErr } = await client
            .from('users')
            .insert({
            username: finalUsername,
            email: rawEmail,
            name,
            password_hash: passwordHash,
            role: 'editor',
            created_by: currentUserId,
        })
            .select('id, email, name, username, role')
            .maybeSingle();
        if (insertErr) {
            this.logger.error('Supabase createCmsUser insert error:', insertErr);
            throw new Error('Failed to create user');
        }
        try {
            const baseUrl = process.env.FRONTEND_URL || process.env.PASSWORD_RESET_BASE_URL || 'http://localhost:5173';
            const loginUrl = `${baseUrl.replace(/\/$/, '')}/login`;
            await this.sendWelcomeEmail(rawEmail, name || finalUsername, finalUsername, initialPassword, loginUrl);
        }
        catch (err) {
            this.logger.error('Failed to send welcome email:', err);
        }
        return {
            id: created.id,
            email: created.email,
            name: created.name,
            username: created.username,
            role: created.role || 'editor',
            initialPassword,
        };
    }
    async listCmsUsers(currentUserId) {
        const client = this.supabaseService.getClient();
        if (!client) {
            throw new Error('User management requires Supabase');
        }
        await this.ensureAdmin(currentUserId);
        const { data, error } = await client
            .from('users')
            .select('id, email, name, username, role, created_at')
            .eq('created_by', currentUserId)
            .neq('role', 'admin')
            .order('created_at', { ascending: false });
        if (error) {
            this.logger.error('Supabase listCmsUsers error:', error);
            throw new Error('Failed to load users');
        }
        return data || [];
    }
    async deleteCmsUser(currentUserId, userIdToDelete) {
        const client = this.supabaseService.getClient();
        if (!client) {
            throw new Error('User management requires Supabase');
        }
        await this.ensureAdmin(currentUserId);
        const { data: target, error: findErr } = await client
            .from('users')
            .select('id, role, created_by')
            .eq('id', userIdToDelete)
            .maybeSingle();
        if (findErr) {
            this.logger.error('Supabase deleteCmsUser find error:', findErr);
            throw new Error('Failed to delete user');
        }
        if (!target) {
            throw new Error('User not found');
        }
        if (target.role === 'admin') {
            throw new Error('Cannot delete an admin user');
        }
        if (target.created_by !== currentUserId) {
            throw new common_1.ForbiddenException('You can only delete users that you created');
        }
        const { error: deleteErr } = await client.from('users').delete().eq('id', userIdToDelete);
        if (deleteErr) {
            this.logger.error('Supabase deleteCmsUser delete error:', deleteErr);
            throw new Error('Failed to delete user');
        }
        return { success: true };
    }
    async requestPasswordReset(email) {
        const client = this.supabaseService.getClient();
        if (!client) {
            this.logger.warn('Password reset requires Supabase');
            return { message: 'If an account exists with this email, you will receive a reset link shortly.' };
        }
        const { data: user, error: findError } = await client
            .from('users')
            .select('id, email')
            .eq('email', email.trim().toLowerCase())
            .maybeSingle();
        if (findError) {
            this.logger.error('Supabase requestPasswordReset select error:', findError);
            return { message: 'If an account exists with this email, you will receive a reset link shortly.' };
        }
        if (!user) {
            return { message: 'If an account exists with this email, you will receive a reset link shortly.' };
        }
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString();
        const { error: updateError } = await client
            .from('users')
            .update({ reset_token: token, reset_token_expires_at: expiresAt })
            .eq('id', user.id);
        if (updateError) {
            this.logger.error('Supabase requestPasswordReset update error:', updateError);
            return { message: 'If an account exists with this email, you will receive a reset link shortly.' };
        }
        const baseUrl = process.env.FRONTEND_URL || process.env.PASSWORD_RESET_BASE_URL || 'http://localhost:5173';
        const resetLink = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
        await this.sendResetEmail(user.email, resetLink);
        return { message: 'If an account exists with this email, you will receive a reset link shortly.' };
    }
    async sendResetEmail(to, resetLink) {
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        if (!host || !user || !pass) {
            this.logger.warn('SMTP not configured; reset link (dev only): ' + resetLink);
            return;
        }
        try {
            const transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            });
            await transporter.sendMail({
                from: process.env.SMTP_FROM || user,
                to,
                subject: 'Reset your YANC CMS password',
                text: `Use this link to reset your password (valid for 1 hour):\n\n${resetLink}\n\nIf you did not request this, you can ignore this email.`,
                html: `<p>Use this link to reset your password (valid for 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, you can ignore this email.</p>`,
            });
        }
        catch (err) {
            this.logger.error('Failed to send reset email:', err);
        }
    }
    async sendWelcomeEmail(to, displayName, username, password, loginUrl) {
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        if (!host || !user || !pass) {
            this.logger.warn('SMTP not configured; welcome email not sent');
            return;
        }
        try {
            const transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            });
            const safeName = displayName || username;
            await transporter.sendMail({
                from: process.env.SMTP_FROM || user,
                to,
                subject: 'Your YANC CMS account',
                text: `Hi ${safeName},

An account has been created for you on the YANC CMS.

Login URL: ${loginUrl}
Username: ${username}
Temporary password: ${password}

For security, please log in and change your password as soon as possible.

If you did not expect this account, you can ignore this email.`,
                html: `<p>Hi ${safeName},</p>
<p>An account has been created for you on the <strong>YANC CMS</strong>.</p>
<p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a><br/>
<strong>Username:</strong> ${username}<br/>
<strong>Temporary password:</strong> ${password}</p>
<p>For security, please log in and change your password as soon as possible.</p>
<p>If you did not expect this account, you can ignore this email.</p>`,
            });
        }
        catch (err) {
            this.logger.error('Failed to send welcome email:', err);
        }
    }
    async resetPassword(token, newPassword) {
        const client = this.supabaseService.getClient();
        if (!client) {
            throw new Error('Password reset is not available');
        }
        const now = new Date().toISOString();
        const { data: user, error: findError } = await client
            .from('users')
            .select('id')
            .eq('reset_token', token)
            .gt('reset_token_expires_at', now)
            .maybeSingle();
        if (findError) {
            this.logger.error('Supabase resetPassword select error:', findError);
            throw new Error('Invalid or expired reset link');
        }
        if (!user) {
            throw new Error('Invalid or expired reset link');
        }
        const newHash = await bcrypt.hash(newPassword, 10);
        const { error: updateError } = await client
            .from('users')
            .update({
            password_hash: newHash,
            reset_token: null,
            reset_token_expires_at: null,
        })
            .eq('id', user.id);
        if (updateError) {
            this.logger.error('Supabase resetPassword update error:', updateError);
            throw new Error('Failed to reset password');
        }
        return { message: 'Password has been reset. You can now log in with your new password.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService, supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map