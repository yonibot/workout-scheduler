import { addDays, format, startOfDay } from 'date-fns'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Event } from '../models/Event'
import { Routine } from '../models/Routine'
import { RoutineItem } from './RoutineItem'

const FullWidthTable = styled.table`
    width: 100%;
    table-layout: fixed;
`

const StyledDayCell = styled.td`
    height: 150px;
    text-align: left;
    vertical-align: top;
    border: 1px solid black;
`

const DayHeader = styled.th`
    font-weight: bold;
    width: 100%;
    height: 25px;
`

const TodayMarker = styled.div<{ isToday: boolean }>`
    &:after {
        content: ${({ isToday }) => (isToday ? "'•'" : "' '")};
        white-space: pre;
    }
`

function getWeekDays(startDate: Date) {
    let dates = []

    for (let i = 0; i < 7; i++) {
        dates.push(addDays(startDate, i))
    }

    return dates
}

function isCurrentDay(date: Date) {
    return date.getTime() === startOfDay(new Date()).getTime()
}

export default function Calendar({
    events,
    startDate,
    handleDragComplete,
    hoverItem,
    handleDragStart,
}: {
    events: Event[]
    startDate: Date
    handleDragComplete: (day: Date) => void
    hoverItem: Routine | null
    handleDragStart: (
        e: React.DragEvent,
        routine: Routine,
        eventId?: number
    ) => void
}) {
    let daysInWeek = getWeekDays(startDate)

    let [hoverDay, setHoverDay] = useState<Date | undefined>()

    function onDragOver(e: React.DragEvent, day: Date) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
        setHoverDay(day)
    }

    function dragLeave() {
        setHoverDay(undefined)
    }

    function onDragComplete(day: Date) {
        handleDragComplete(day)
        setHoverDay(undefined)
    }

    return (
        <FullWidthTable>
            <tr>
                {daysInWeek.map((day: Date) => {
                    console.log({ day })
                    return (
                        <DayHeader>
                            <TodayMarker isToday={isCurrentDay(day)} />
                            <div>{format(day, 'eee dd')}</div>
                        </DayHeader>
                    )
                })}
            </tr>
            <tr>
                {daysInWeek.map((day: Date) => {
                    return (
                        <StyledDayCell
                            onDragOver={(e) => onDragOver(e, day)}
                            onDrop={(e) => {
                                e.preventDefault()
                                onDragComplete(day)
                            }}
                            onDragLeave={dragLeave}
                        >
                            {events
                                .filter(
                                    (e) =>
                                        new Date(e.date).getDay() ===
                                        day.getDay()
                                )
                                .map((event) => {
                                    return (
                                        <RoutineItem
                                            draggable
                                            routine={event.routine}
                                            onDragStart={(
                                                e: React.DragEvent
                                            ) => {
                                                handleDragStart(
                                                    e,
                                                    event.routine,
                                                    event.id
                                                )
                                            }}
                                        />
                                    )
                                })}
                            {hoverItem != null &&
                                hoverDay?.getTime() === day.getTime() && (
                                    <RoutineItem
                                        routine={hoverItem}
                                        translucent
                                    />
                                )}
                        </StyledDayCell>
                    )
                })}
            </tr>
        </FullWidthTable>
    )
}
