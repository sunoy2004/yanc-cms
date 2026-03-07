import { ActivityService } from './activity.service';
export declare class ActivityController {
    private activity;
    constructor(activity: ActivityService);
    recent(limit?: string): Promise<{
        id: any;
        action: string;
        contentType: string;
        contentTitle: any;
        user: string;
        timestamp: any;
    }[]>;
}
