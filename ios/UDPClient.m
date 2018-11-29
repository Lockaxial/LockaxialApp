//
//  UDPBridge.m
//  Intermobile
//
//  Created by 结点科技 on 2017/3/2.
//  Copyright © 2017年 Facebook. All rights reserved.
//
#import <Foundation/Foundation.h>
#import "UDPClient.h"
#import "UDPHandler.h"

@interface UDPClient()
{
  UDPHandler *handler;
}

@end

@implementation UDPClient

  RCT_EXPORT_MODULE();

  RCT_EXPORT_METHOD(write:(NSString *)data :(RCTResponseSenderBlock)callback)
  {
    RCTLogInfo(@"Pretending to create an event %@", data);
    handler = [UDPHandler shareInstance];
    [handler write:data cb:callback];
  }

@end
