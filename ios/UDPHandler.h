//
//  UDPHandler.h
//  Intermobile
//
//  Created by 结点科技 on 2017/3/4.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "GCDAsyncUDPSocket.h"
#import "RCTBridgeModule.h"

@interface UDPHandler : NSObject<GCDAsyncUdpSocketDelegate>

// 获取伪单例
+ (UDPHandler*) shareInstance;

- (void) setupSocket;

// 向UDP服务端发送信息
- (uint8_t) write:(NSString*) data cb:(RCTResponseSenderBlock)callback;

- (void) cancelRequest;

@end
