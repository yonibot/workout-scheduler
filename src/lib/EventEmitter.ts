interface EmitterEvent {
    name: string
    handler: (arg: any) => void
}

export class EventEmitter {
    subscribedEvents: EmitterEvent[] = []

    subscribeTo(events: EmitterEvent[]) {
        events.forEach((event) => this.subscribedEvents.push(event))
    }

    emit(eventName: string) {
        this.subscribedEvents.forEach((event) => {
            if (event.name === eventName) event.handler(event.name)
        })
    }
}
