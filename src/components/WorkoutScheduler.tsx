import React, { useCallback, useEffect, useState } from 'react'
import { startOfWeek, endOfWeek, subDays, addDays, format } from 'date-fns'
import Calendar from './Calendar'
import { BounceLoader } from 'react-spinners'
import styled from 'styled-components'
import RoutinesList from './RoutinesList'
import { Routine } from '../models/Routine'
import { Event } from '../models/Event'
import TrashBin from './TrashBin'
import { EventEmitter } from '../lib/EventEmitter'

const TODAY_RANGE = [startOfWeek(new Date()), endOfWeek(new Date())]

export const API_URL = process.env.REACT_APP_HASURA_URL as string
export const hasuraSecret = process.env.REACT_APP_HASURA_SECRET as string
export const HASURA_HEADERS = {
    'x-hasura-admin-secret': hasuraSecret,
}

function formatDateForGraphQl(date: Date) {
    return format(date, 'yyyy-MM-dd').toString()
}

let fetchEvents = async (startDate: Date, endDate: Date) => {
    let strStartDate = formatDateForGraphQl(startDate)
    let strEndDate = formatDateForGraphQl(endDate)

    return fetch(
        `${API_URL}/events?startDate=${strStartDate}&endDate=${strEndDate}`,
        {
            headers: HASURA_HEADERS,
        }
    )
}

export const eventEmitter = new EventEmitter()

let createEvent = async (routineId: string, date: Date) => {
    let dateString = formatDateForGraphQl(date)

    return fetch(`${API_URL}/events`, {
        method: 'post',
        body: JSON.stringify({ routine_id: routineId, date: dateString }),
        headers: HASURA_HEADERS,
    })
}

let removeEvent = async (eventId: number) => {
    return fetch(`${API_URL}/events`, {
        method: 'delete',
        body: JSON.stringify({ id: eventId }),
        headers: HASURA_HEADERS,
    })
}

const MoveDate = styled.span`
    display: inline;
    cursor: pointer;
`

const Container = styled.div`
    max-width: 90%;
    margin-left: auto;
    margin-right: auto;
`

export const CenteredSpinner = styled(BounceLoader)`
    margin: auto;
    vertical-align: middle;
`

const CalendarContainer = styled.div`
    height: 300px;
    display: flex;
`

const Fetching = styled.div`
    height: 25px;
`

const Header = styled.div`
    text-align: center;
`

function LeftButton({ onClick }: { onClick: () => void }) {
    return <MoveDate onClick={onClick}>{`<-`}</MoveDate>
}

function RightButton({ onClick }: { onClick: () => void }) {
    return <MoveDate onClick={onClick}>{`->`}</MoveDate>
}

function useDates() {
    let [dateRange, setDateRange] = useState(TODAY_RANGE)

    function updateRange(direction: 'back' | 'forward' | 'today') {
        let newRange = []

        if (direction === 'back') {
            newRange = [subDays(dateRange[0], 7), subDays(dateRange[1], 7)]
        } else if (direction === 'forward') {
            newRange = [addDays(dateRange[0], 7), addDays(dateRange[1], 7)]
        } else {
            newRange = TODAY_RANGE
        }

        setDateRange(newRange)
    }

    return { updateRange, dateRange }
}

enum DragMode {
    Move = 'move',
    Create = 'create',
}

function WorkoutScheduler() {
    let [events, setEvents] = useState<Event[]>([])
    let [isFetchingEvents, setIsFetchingEvents] = useState(false)
    let { updateRange, dateRange } = useDates()
    let [draggedRoutine, setDraggedRoutine] = useState<Routine | null>(null)
    let [currentEventId, setCurrentEventId] = useState<number | undefined>(
        undefined
    )
    let [dragMode, setDragMode] = useState<DragMode>(DragMode.Move)

    useEffect(() => {
        eventEmitter.subscribeTo([
            {
                name: 'starting drag',
                handler: (e: string) => console.log('NOTE: ', e),
            },
        ])
    }, [])

    async function createEventOn(routineId: string, day: Date) {
        try {
            await createEvent(routineId, day)
            fetchEventData()
        } catch (error) {
            console.log('Create error, ', error)
            // removeDragRoutineFromDay(day)
        }
    }

    const fetchEventData = useCallback(async () => {
        setIsFetchingEvents(true)
        try {
            let response = await fetchEvents(dateRange[0], dateRange[1])
            let jsonResponse = await response.json()
            setEvents(jsonResponse.events)
        } catch (error) {
            console.log('Fetch error. ', error)
        } finally {
            setIsFetchingEvents(false)
        }
    }, [dateRange])

    async function addDragRoutineToDay(day: Date) {
        if (draggedRoutine == null) return

        setEvents([
            ...events,
            {
                routine: draggedRoutine,
                date: day.toString(),
            },
        ])
    }

    async function moveDragRoutineTo(day: Date, eventId: number) {
        if (draggedRoutine == null) return

        await removeEvent(eventId)
        await createEvent(draggedRoutine.id, day)
        fetchEventData()
    }

    const handleDragComplete = useCallback(
        async (day: Date) => {
            if (draggedRoutine == null) return

            if (dragMode === DragMode.Move && currentEventId != null) {
                addDragRoutineToDay(day)
                moveDragRoutineTo(day, currentEventId)
            } else {
                addDragRoutineToDay(day)
                createEventOn(draggedRoutine.id, day)
            }
        },
        [draggedRoutine]
    )

    const deleteEvent = useCallback(async () => {
        if (currentEventId == null) return

        await removeEvent(currentEventId)
        fetchEventData()
    }, [currentEventId])

    // const handleDragStart = useCallback((routine: Routine) => {
    //     setDraggedRoutine(routine)
    // }, [])

    useEffect(() => {
        fetchEventData()
    }, [dateRange])

    // eew but kewl
    // effect on renders -> ability to use useCallback
    // write a post on callbacks with arguments from current context
    const handleDragStart =
        (dragMode: DragMode) =>
        (e: React.DragEvent, routine: Routine, eventId?: number) => {
            setCurrentEventId(eventId)
            setDragMode(dragMode)
            setDraggedRoutine(routine)
            e.dataTransfer.dropEffect = 'copy'
        }

    return (
        <Container className="App">
            <Header>
                <h4>Workout Scheduler</h4>
                <LeftButton onClick={() => updateRange('back')} />
                {dateRange[0].toDateString()} - {dateRange[1].toDateString()}{' '}
                <RightButton onClick={() => updateRange('forward')} />
                <div>
                    <MoveDate onClick={() => updateRange('today')}>
                        [this week]
                    </MoveDate>
                </div>
                <Fetching>{isFetchingEvents && 'Fetching data...'}</Fetching>
            </Header>
            <CalendarContainer>
                <Calendar
                    handleDragComplete={handleDragComplete}
                    hoverItem={draggedRoutine}
                    events={events}
                    startDate={dateRange[0]}
                    handleDragStart={handleDragStart(DragMode.Move)}
                />
            </CalendarContainer>
            <h4>My Routines</h4>
            <RoutinesList handleDragStart={handleDragStart(DragMode.Create)} />
            <TrashBin onDrop={deleteEvent} />
        </Container>
    )
}

export default WorkoutScheduler
