export interface SessionType {
    id: string;
    refresh_token: string;
    userAgent: string;
    isVerified?: boolean;
    isConnecteToGoogle?: boolean;
}
