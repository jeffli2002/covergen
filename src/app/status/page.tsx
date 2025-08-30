'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  RefreshCw,
  Wifi,
  Server,
  Database,
  Zap,
  Mail
} from 'lucide-react'

const systemComponents = [
  {
    id: 'ai-generation',
    name: 'AI Generation Service',
    description: 'Core AI image generation functionality',
    status: 'operational',
    uptime: '99.9%',
    lastIncident: null
  },
  {
    id: 'image-processing',
    name: 'Image Processing',
    description: 'Image upload, resizing, and optimization',
    status: 'operational',
    uptime: '99.8%',
    lastIncident: null
  },
  {
    id: 'user-authentication',
    name: 'User Authentication',
    description: 'Login, registration, and account management',
    status: 'operational',
    uptime: '99.9%',
    lastIncident: null
  },
  {
    id: 'payment-processing',
    name: 'Payment Processing',
    description: 'Subscription and billing services',
    status: 'operational',
    uptime: '99.7%',
    lastIncident: null
  },
  {
    id: 'api-services',
    name: 'API Services',
    description: 'External API integrations and webhooks',
    status: 'operational',
    uptime: '99.6%',
    lastIncident: null
  }
]

const recentIncidents = [
  {
    id: 1,
    title: 'Scheduled Maintenance - Image Processing',
    description: 'Routine maintenance to improve image processing performance',
    status: 'resolved',
    startTime: '2025-01-10T02:00:00Z',
    endTime: '2025-01-10T04:00:00Z',
    impact: 'minor',
    updates: [
      {
        time: '2025-01-10T02:00:00Z',
        message: 'Maintenance started - Image processing may be slower than usual'
      },
      {
        time: '2025-01-10T04:00:00Z',
        message: 'Maintenance completed - All services operating normally'
      }
    ]
  }
]

export default function StatusPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800'
      case 'degraded': return 'bg-yellow-100 text-yellow-800'
      case 'outage': return 'bg-red-100 text-red-800'
      case 'maintenance': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return CheckCircle
      case 'degraded': return AlertTriangle
      case 'outage': return XCircle
      case 'maintenance': return Clock
      default: return Activity
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'none': return 'bg-green-100 text-green-800'
      case 'minor': return 'bg-yellow-100 text-yellow-800'
      case 'major': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const refreshStatus = () => {
    setLastUpdated(new Date())
  }

  const overallStatus = systemComponents.every(comp => comp.status === 'operational') 
    ? 'operational' 
    : 'degraded'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">
              System Status
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Real-time status of CoverGen AI services and infrastructure
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Overall Status */}
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-primary" />
                  Overall System Status
                </CardTitle>
                <Button variant="outline" onClick={refreshStatus} size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                {(() => {
                  const Icon = getStatusIcon(overallStatus)
                  return (
                    <div className={`p-3 rounded-lg ${getStatusColor(overallStatus)}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  )
                })()}
                <div>
                  <h2 className="text-2xl font-bold capitalize">
                    {overallStatus.replace('-', ' ')}
                  </h2>
                  <p className="text-muted-foreground">
                    All systems are operating normally
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Component Status */}
          <Card>
            <CardHeader>
              <CardTitle>Component Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemComponents.map((component) => {
                  const Icon = getStatusIcon(component.status)
                  return (
                    <div key={component.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(component.status)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{component.name}</h3>
                          <p className="text-sm text-muted-foreground">{component.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getStatusColor(component.status)}>
                          {component.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          Uptime: {component.uptime}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Incidents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              {recentIncidents.length > 0 ? (
                <div className="space-y-6">
                  {recentIncidents.map((incident) => (
                    <div key={incident.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{incident.title}</h3>
                          <p className="text-sm text-muted-foreground">{incident.description}</p>
                        </div>
                        <Badge className={getImpactColor(incident.impact)}>
                          {incident.impact} impact
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Started: {new Date(incident.startTime).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Resolved: {new Date(incident.endTime).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Updates:</h4>
                        {incident.updates.map((update, index) => (
                          <div key={index} className="text-sm bg-muted p-2 rounded">
                            <div className="text-muted-foreground">
                              {new Date(update.time).toLocaleString()}
                            </div>
                            <div>{update.message}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <p>No recent incidents reported</p>
                  <p className="text-sm">All systems are operating normally</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                  <div className="text-sm text-muted-foreground">Overall Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">~50ms</div>
                  <div className="text-sm text-muted-foreground">Average Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Monitoring</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscribe to Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Stay Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Get notified about system status updates and incidents via email.
              </p>
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                Subscribe to Status Updates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

