/// <reference types="react-native" />
import * as React from 'react';
import * as PropTypes from 'prop-types';
export declare class Element extends React.Component<{
    elementId: any;
    resizeMode?: any;
}, any> {
    static propTypes: {
        elementId: PropTypes.Validator<string>;
        resizeMode: PropTypes.Requireable<string>;
    } | {
        hitSlop: PropTypes.Validator<import("react-native").Insets | undefined>;
        onLayout: PropTypes.Validator<((event: import("react-native").LayoutChangeEvent) => void) | undefined>;
        pointerEvents: PropTypes.Validator<"auto" | "box-none" | "none" | "box-only" | undefined>;
        removeClippedSubviews: PropTypes.Validator<boolean | undefined>;
        style: PropTypes.Validator<import("react-native").StyleProp<import("react-native").ViewStyle>>;
        testID: PropTypes.Validator<string | undefined>;
        collapsable: PropTypes.Validator<boolean | undefined>;
        needsOffscreenAlphaCompositing: PropTypes.Validator<boolean | undefined>;
        renderToHardwareTextureAndroid: PropTypes.Validator<boolean | undefined>;
        accessibilityViewIsModal: PropTypes.Validator<boolean | undefined>;
        accessibilityActions: PropTypes.Validator<string[] | undefined>;
        onAccessibilityAction: PropTypes.Validator<(() => void) | undefined>;
        shouldRasterizeIOS: PropTypes.Validator<boolean | undefined>;
        onStartShouldSetResponder: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => boolean) | undefined>;
        onMoveShouldSetResponder: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => boolean) | undefined>;
        onResponderEnd: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined>;
        onResponderGrant: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined>;
        onResponderReject: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined>;
        onResponderMove: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined>;
        onResponderRelease: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined>;
        onResponderStart: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined>;
        onResponderTerminationRequest: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => boolean) | undefined>;
        onResponderTerminate: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined>;
        onStartShouldSetResponderCapture: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => boolean) | undefined>;
        onMoveShouldSetResponderCapture: PropTypes.Validator<(() => void) | undefined>;
        onTouchStart: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined>;
        onTouchMove: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined>;
        onTouchEnd: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined>;
        onTouchCancel: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined>;
        onTouchEndCapture: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined>;
        accessible: PropTypes.Validator<boolean | undefined>;
        accessibilityLabel: PropTypes.Validator<string | undefined>;
        accessibilityComponentType: PropTypes.Validator<"none" | "button" | "radiobutton_checked" | "radiobutton_unchecked" | undefined>;
        accessibilityLiveRegion: PropTypes.Validator<"none" | "polite" | "assertive" | undefined>;
        importantForAccessibility: PropTypes.Validator<"auto" | "yes" | "no" | "no-hide-descendants" | undefined>;
        accessibilityTraits: PropTypes.Validator<"selected" | "image" | "none" | "button" | "link" | "header" | "search" | "plays" | "key" | "text" | "summary" | "disabled" | "frequentUpdates" | "startsMedia" | "adjustable" | "allowsDirectInteraction" | "pageTurn" | import("react-native").AccessibilityTraits[] | undefined>;
        onAcccessibilityTap: PropTypes.Validator<(() => void) | undefined>;
        onMagicTap: PropTypes.Validator<(() => void) | undefined>;
        elementId: PropTypes.Validator<string>;
        resizeMode: PropTypes.Requireable<string>;
    };
    static defaultProps: {
        resizeMode: string;
    };
    render(): JSX.Element;
}
