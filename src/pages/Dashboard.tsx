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

// Mock data - replace with API calls
const stats = {
  events: { total: 24, published: 18, trend: 12 },
  team: { total: 32, published: 28, trend: 8 },
  programs: { total: 8, published: 6, trend: 25 },
  testimonials: { total: 15, published: 12, trend: 5 },
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
          trend={{ value: stats.events.trend, isPositive: true }}
        />
        <StatCard
          title="Team Members"
          value={stats.team.total}
          description={`${stats.team.published} published`}
          icon={Users}
          trend={{ value: stats.team.trend, isPositive: true }}
        />
        <StatCard
          title="Programs"
          value={stats.programs.total}
          description={`${stats.programs.published} published`}
          icon={GraduationCap}
          trend={{ value: stats.programs.trend, isPositive: true }}
        />
        <StatCard
          title="Testimonials"
          value={stats.testimonials.total}
          description={`${stats.testimonials.published} published`}
          icon={MessageSquareQuote}
          trend={{ value: stats.testimonials.trend, isPositive: true }}
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
                  key={activity.id}
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
                      {activity.timestamp}
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
