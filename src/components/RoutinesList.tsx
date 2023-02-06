import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { API_URL, eventEmitter, HASURA_HEADERS } from './WorkoutScheduler'
import { Routine } from '../models/Routine'
import { RoutineItem } from './RoutineItem'
import { EventEmitter } from 'stream'

const Container = styled.div`
    height: 100px;
    width: 100%;
    text-align: left;
`

const InlineRoutineItem = styled(RoutineItem)`
    display: inline;
    margin-right: 20px;
`

let fetchRoutines = () =>
    fetch(`${API_URL}/routines`, { headers: HASURA_HEADERS })

interface RoutinesListInterface {
    handleDragStart: (e: React.DragEvent, routine: Routine) => void
}

export default function RoutinesList({
    handleDragStart,
}: RoutinesListInterface) {
    let [routines, setRoutines] = useState<Routine[]>([])

    useEffect(() => {
        async function fetchRoutineData() {
            try {
                let response = await fetchRoutines()
                let jsonResponse = await response.json()
                setRoutines(jsonResponse.routines)
            } catch (error) {
                console.log('Fetch error. ', error)
            }
        }

        fetchRoutineData()
    }, [])

    return (
        <Container>
            {routines.map((routine) => (
                <InlineRoutineItem
                    routine={routine}
                    key={routine.id}
                    draggable
                    onDragStart={(e: React.DragEvent) => {
                        eventEmitter.emit('starting drag....')
                        handleDragStart(e, routine)
                    }}
                />
            ))}
        </Container>
    )
}
