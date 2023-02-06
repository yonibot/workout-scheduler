import React from 'react'
import styled from 'styled-components'
import { Routine } from '../models/Routine'

const ColorCircle = styled.span`
    height: 25px;
    width: 25px;
    border-radius: 50%;
    display: inline-block;
    background-color: #${(props) => props.color};
    vertical-align: middle;
`

const StyledEvent = styled.div<{ translucent: boolean }>`
    margin-bottom: 10px;
    cursor: pointer;
    opacity: ${({ translucent }) => (translucent ? '0.5' : '1')};
`

export function RoutineItem({
    routine,
    className,
    draggable = false,
    onDragStart,
    translucent = false,
}: {
    routine: Routine
    className?: string
    draggable?: boolean
    onDragStart?: (e: React.DragEvent) => void
    translucent?: boolean
}) {
    return (
        <StyledEvent
            className={className}
            draggable={draggable}
            onDragStart={onDragStart}
            translucent={translucent}
        >
            <ColorCircle color={routine.colour_code} />
            <span> {routine.name}</span>
        </StyledEvent>
    )
}
