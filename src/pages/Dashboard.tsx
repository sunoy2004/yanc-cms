import { PageHeader } from '@/components/cms/PageHeader';
import { StatCard } from '@/components/cms/StatCard';
import {
  Calendar,
  Users,
  GraduationCap,
  MessageSquareQuote,
  FileText,
  Image,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';

type Stat = { total: number; published: number; trend?: number };

const initialStats: Record<string, Stat> = {
  events: { total: 0, published: 0, trend: 0 },
  team: { total: 0, published: 0, trend: 0 },
  programs: { total: 0, published: 0, trend: 0 },
  testimonials: { total: 0, published: 0, trend: 0 },
};

const recentActivity = [
  {
    id: '1',
    action: 'update',
    contentType: 'Event',
    contentTitle: 'Annual Tech Summit 2025',
    user: 'Admin User',
    timestamp: '2 minutes ago',
  },
  {
    id: '2',
    action: 'publish',
    contentType: 'Team Member',
    contentTitle: 'John Smith',
    user: 'Admin User',
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    action: 'create',
    contentType: 'Program',
    contentTitle: 'Leadership Workshop',
    user: 'Admin User',
    timestamp: '3 hours ago',
  },
  {
    id: '4',
    action: 'update',
    contentType: 'Hero Content',
    contentTitle: 'Main Hero Banner',
    user: 'Admin User',
    timestamp: '5 hours ago',
  },
  {
    id: '5',
    action: 'delete',
    contentType: 'Testimonial',
    contentTitle: 'Old Testimonial',
    user: 'Admin User',
    timestamp: 'Yesterday',
  },
];

const quickActions = [
  { label: 'Add Event', icon: Calendar, href: '/events/past' },
  { label: 'Add Team Member', icon: Users, href: '/team/executive' },
  { label: 'Upload Media', icon: Image, href: '/media' },
  { label: 'Edit Hero', icon: FileText, href: '/hero' },
];

export default function Dashboard() {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-success';
      case 'update':
        return 'text-accent';
      case 'publish':
        return 'text-primary';
      case 'delete':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };
  const [stats, setStats] = useState(initialStats);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_CMS_BASE_URL || ''}/api/stats`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setStats({
          events: { ...data.events, trend: data.events.trend ?? 0 },
          team: { ...data.team, trend: data.team.trend ?? 0 },
          programs: { ...data.programs, trend: data.programs.trend ?? 0 },
          testimonials: { ...data.testimonials, trend: data.testimonials.trend ?? 0 },
        });
      } catch (err) {
        // keep defaults
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const [recentActivity, setRecentActivity] = useState<
    {
      id: string;
      action: string;
      contentType: string;
      contentTitle: string;
      user: string;
      timestamp: string;
    }[]
  >([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_CMS_BASE_URL || ''}/api/activity?limit=8`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setRecentActivity(data);
      } catch (err) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your content."
      />

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Events"
          value={stats.events.total}
          description={`${stats.events.published} published`}
          icon={Calendar}
          trend={{ value: stats.events.trend ?? 0, isPositive: (stats.events.trend ?? 0) >= 0 }}
        />
        <StatCard
          title="Team Members"
          value={stats.team.total}
          description={`${stats.team.published} published`}
          icon={Users}
          trend={{ value: stats.team.trend ?? 0, isPositive: (stats.team.trend ?? 0) >= 0 }}
        />
        <StatCard
          title="Programs"
          value={stats.programs.total}
          description={`${stats.programs.published} published`}
          icon={GraduationCap}
          trend={{ value: stats.programs.trend ?? 0, isPositive: (stats.programs.trend ?? 0) >= 0 }}
        />
        <StatCard
          title="Testimonials"
          value={stats.testimonials.total}
          description={`${stats.testimonials.published} published`}
          icon={MessageSquareQuote}
          trend={{ value: stats.testimonials.trend ?? 0, isPositive: (stats.testimonials.trend ?? 0) >= 0 }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="cms-card lg:col-span-2">
          <div className="cms-card-header flex items-center justify-between">
            <h2 className="cms-section-title">Recent Activity</h2>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="cms-card-content">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={`${activity.contentType}-${activity.id}-${activity.timestamp}`}
                  className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full bg-muted',
                      getActionColor(activity.action)
                    )}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      <span className={cn('capitalize', getActionColor(activity.action))}>
                        {activity.action}
                      </span>{' '}
                      {activity.contentType}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.contentTitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="cms-card">
          <div className="cms-card-header">
            <h2 className="cms-section-title">Quick Actions</h2>
          </div>
          <div className="cms-card-content">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-colors hover:border-accent hover:bg-accent/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {action.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
