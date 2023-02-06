import { Routine } from './Routine'

export interface Event {
    date: string
    routine: Routine
    id?: number
}
