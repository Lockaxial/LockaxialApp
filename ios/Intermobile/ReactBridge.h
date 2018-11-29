//
//  ReactBridge.h
//  Intermobile
//  react 桥类声明
//  Created by 结点科技 on 2017/2/17.
//  Copyright © 2017年 Facebook. All rights reserved.
//
#import "RCTBridgeModule.h"

@interface ReactBridge : NSObject<RCTBridgeModule>
+(ReactBridge *)getInstance;
+(void)sendMessage:(NSString*)eventName notification:(NSNotification *)notification; //给React发送消息
@end
