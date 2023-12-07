import { Request, Response } from "express";
export declare const googleoauthHandler: (req: Request, res: Response) => Promise<void | Response<any, Record<string, any>>>;
export declare const oauthHanlder: (req: Request, res: Response) => void;
export declare const googleConnectHandler: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
