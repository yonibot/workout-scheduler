import React, { useState } from 'react'
import styled from 'styled-components'

const StyledTrashbin = styled.div<{ isHover: boolean }>`
    height: 50px;
    width: 200px;
    font-weight: ${({ isHover }) => (isHover ? 'bold' : 'regular')};
    border: 1px solid green;
`

export default function TrashBin({ onDrop }: { onDrop: () => void }) {
    let [isHover, setIsHover] = useState(false)

    return (
        <StyledTrashbin
            onDragOver={(e: React.DragEvent) => {
                e.preventDefault()
                setIsHover(true)
                e.dataTransfer.dropEffect = 'copy'
            }}
            onDragLeave={() => {
                setIsHover(false)
            }}
            onDrop={() => {
                setIsHover(false)
                onDrop()
            }}
            isHover={isHover}
        >
            {isHover ? 'Drop to delete' : 'Trash Bin'}
        </StyledTrashbin>
    )
}
