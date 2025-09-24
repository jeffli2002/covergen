'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { checkoutSessionManager } from '@/services/payment/checkout-session-manager'
import { format } from 'date-fns'

interface SessionAnalytics {
  date: string
  total_sessions: number
  completed_sessions: number
  expired_sessions: number
  cancelled_sessions: number
  unique_users: number
  avg_completion_time_seconds: number | null
}

export function CheckoutSessionMonitor() {
  const [analytics, setAnalytics] = useState<SessionAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchAnalytics = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await checkoutSessionManager.getAnalytics(30) // Last 30 days
      
      if (result.success && result.data) {
        setAnalytics(result.data)
        setLastRefresh(new Date())
      } else {
        setError(result.error || 'Failed to fetch analytics')
      }
    } catch (err) {
      setError('Error fetching analytics')
      console.error('Analytics error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const calculateConversionRate = (total: number, completed: number) => {
    if (total === 0) return 0
    return ((completed / total) * 100).toFixed(1)
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  const getTotalStats = () => {
    return analytics.reduce((acc, day) => ({
      total: acc.total + day.total_sessions,
      completed: acc.completed + day.completed_sessions,
      expired: acc.expired + day.expired_sessions,
      cancelled: acc.cancelled + day.cancelled_sessions,
      uniqueUsers: acc.uniqueUsers + day.unique_users
    }), { total: 0, completed: 0, expired: 0, cancelled: 0, uniqueUsers: 0 })
  }

  if (isLoading && analytics.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  const totals = getTotalStats()

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.total}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.completed}</div>
            <p className="text-xs text-muted-foreground">
              {calculateConversionRate(totals.total, totals.completed)}% conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.expired}</div>
            <p className="text-xs text-muted-foreground">
              {calculateConversionRate(totals.total, totals.expired)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Attempted checkout</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Checkout Session Analytics</CardTitle>
            <CardDescription>
              Daily breakdown of checkout sessions
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center justify-center h-32 text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Expired</TableHead>
                    <TableHead>Cancelled</TableHead>
                    <TableHead>Conversion</TableHead>
                    <TableHead>Avg Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    analytics.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell>{format(new Date(day.date), 'MMM dd')}</TableCell>
                        <TableCell>{day.total_sessions}</TableCell>
                        <TableCell>
                          <Badge variant={day.completed_sessions > 0 ? "default" : "secondary"}>
                            {day.completed_sessions}
                          </Badge>
                        </TableCell>
                        <TableCell>{day.expired_sessions}</TableCell>
                        <TableCell>{day.cancelled_sessions}</TableCell>
                        <TableCell>
                          <Badge variant={
                            Number(calculateConversionRate(day.total_sessions, day.completed_sessions)) > 50
                              ? "default"
                              : "secondary"
                          }>
                            {calculateConversionRate(day.total_sessions, day.completed_sessions)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDuration(day.avg_completion_time_seconds)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground text-center">
        Last refreshed: {format(lastRefresh, 'PPp')}
      </div>
    </div>
  )
}