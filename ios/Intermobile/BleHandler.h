//
//  BleHandler.h
//  Intermobile
//
//  Created by 结点科技 on 2017/5/17.
//  Copyright © 2017年 Facebook. All rights reserved.
//
#import <CoreBluetooth/CoreBluetooth.h>
#import<CoreBluetooth/CBService.h>

@interface BleHandler : NSObject<CBCentralManagerDelegate,CBPeripheralDelegate>
-(void) startBleScan;
-(void) stopBleScan;
-(void)openBleLock:(NSString *)deviceName username:(NSString *)username unitNo:(NSString *)unitNo;
+(BleHandler *)getInstance;
@end
