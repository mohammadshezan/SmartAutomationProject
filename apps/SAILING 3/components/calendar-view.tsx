"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Ship, Truck, Clock } from "lucide-react"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    const events = [
      { date: 15, type: "vessel", title: "MV Steel Carrier Arrival", time: "08:00" },
      { date: 15, type: "rake", title: "RAKE-001 Departure", time: "14:30" },
      { date: 16, type: "vessel", title: "MV Iron Duke Arrival", time: "06:00" },
      { date: 16, type: "rake", title: "RAKE-002 Departure", time: "10:00" },
      { date: 17, type: "vessel", title: "MV Limestone Express", time: "12:00" },
      { date: 18, type: "rake", title: "RAKE-003 Departure", time: "08:30" },
    ]

    return events.filter((event) => event.date === date.getDate())
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Dispatch & Arrival Timeline
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-32 text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>Track dispatch and arrival timelines across all operations</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2 h-20"></div>
                }

                const events = getEventsForDate(day)
                const isSelected = selectedDate?.toDateString() === day.toDateString()
                const isToday = new Date().toDateString() === day.toDateString()

                return (
                  <div
                    key={index}
                    className={`p-1 h-20 border rounded cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                        : isToday
                          ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-sm font-medium mb-1">{day.getDate()}</div>
                    <div className="space-y-1">
                      {events.slice(0, 2).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className={`text-xs px-1 py-0.5 rounded truncate ${
                            event.type === "vessel"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          }`}
                        >
                          {event.time}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className="text-xs text-muted-foreground">+{events.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {selectedDate ? `Events for ${selectedDate.toLocaleDateString()}` : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div
                      className={`p-1 rounded ${
                        event.type === "vessel" ? "bg-blue-100 dark:bg-blue-900" : "bg-orange-100 dark:bg-orange-900"
                      }`}
                    >
                      {event.type === "vessel" ? (
                        <Ship className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Truck className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {getEventsForDate(selectedDate).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No events scheduled for this date</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Click on a date to view scheduled events</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ship className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="font-medium">8 Vessel Arrivals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="font-medium">12 Rake Dispatches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Turnaround</p>
                <p className="font-medium">2.3 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                On Time
              </Badge>
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="font-medium">94.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
