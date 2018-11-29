import * as React from 'react';
import * as PropTypes from 'prop-types';
import { TouchableOpacity, TouchableHighlight, TouchableNativeFeedback, TouchableWithoutFeedback, GestureResponderEvent, NativeTouchEvent, NativeSyntheticEvent } from 'react-native';
interface NativeTouchEventWithForce extends NativeTouchEvent {
    force: number;
}
interface GestureResponderEventWithForce extends NativeSyntheticEvent<NativeTouchEventWithForce> {
}
export interface Props {
    children: React.ReactNode;
    touchableComponent?: TouchableHighlight | TouchableOpacity | TouchableNativeFeedback | TouchableWithoutFeedback | React.ReactNode;
    onPress?: () => void;
    onPressIn?: (reactTag?: any) => void;
    onPeekIn?: () => void;
    onPeekOut?: () => void;
}
export declare class TouchablePreview extends React.PureComponent<Props, any> {
    static propTypes: {
        children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        touchableComponent: PropTypes.Requireable<(...args: any[]) => any>;
        onPress: PropTypes.Requireable<(...args: any[]) => any>;
        onPressIn: PropTypes.Requireable<(...args: any[]) => any>;
        onPeekIn: PropTypes.Requireable<(...args: any[]) => any>;
        onPeekOut: PropTypes.Requireable<(...args: any[]) => any>;
    };
    static defaultProps: {
        touchableComponent: import("react-native").TouchableWithoutFeedbackStatic;
    };
    static peeking: boolean;
    private ref;
    private timeout;
    private ts;
    onRef: (ref: React.Component<any, {}, any>) => void;
    onPress: () => void;
    onPressIn: () => void | null;
    onTouchStart: (event: GestureResponderEvent) => void;
    onTouchMove: (event: GestureResponderEventWithForce) => void;
    onTouchEnd: () => void;
    render(): JSX.Element;
}
export {};
