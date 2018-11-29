/// <reference types="react" />
import { NativeEventsReceiver } from '../adapters/NativeEventsReceiver';
import { CommandsObserver } from './CommandsObserver';
import { EventSubscription } from '../interfaces/EventSubscription';
import { ComponentEventsObserver } from './ComponentEventsObserver';
import { ComponentDidAppearEvent, ComponentDidDisappearEvent, NavigationButtonPressedEvent, SearchBarUpdatedEvent, SearchBarCancelPressedEvent, PreviewCompletedEvent, ModalDismissedEvent } from '../interfaces/ComponentEvents';
import { CommandCompletedEvent, BottomTabSelectedEvent } from '../interfaces/Events';
export declare class EventsRegistry {
    private nativeEventsReceiver;
    private commandsObserver;
    private componentEventsObserver;
    constructor(nativeEventsReceiver: NativeEventsReceiver, commandsObserver: CommandsObserver, componentEventsObserver: ComponentEventsObserver);
    registerAppLaunchedListener(callback: () => void): EventSubscription;
    registerComponentDidAppearListener(callback: (event: ComponentDidAppearEvent) => void): EventSubscription;
    registerComponentDidDisappearListener(callback: (event: ComponentDidDisappearEvent) => void): EventSubscription;
    registerCommandCompletedListener(callback: (event: CommandCompletedEvent) => void): EventSubscription;
    registerBottomTabSelectedListener(callback: (event: BottomTabSelectedEvent) => void): EventSubscription;
    registerNavigationButtonPressedListener(callback: (event: NavigationButtonPressedEvent) => void): EventSubscription;
    registerModalDismissedListener(callback: (event: ModalDismissedEvent) => void): EventSubscription;
    registerSearchBarUpdatedListener(callback: (event: SearchBarUpdatedEvent) => void): EventSubscription;
    registerSearchBarCancelPressedListener(callback: (event: SearchBarCancelPressedEvent) => void): EventSubscription;
    registerPreviewCompletedListener(callback: (event: PreviewCompletedEvent) => void): EventSubscription;
    registerCommandListener(callback: (name: string, params: any) => void): EventSubscription;
    bindComponent(component: React.Component<any>, componentId?: string): EventSubscription;
}
