/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <UIKit/UIKit.h>
#import <RCTJPushModule.h>
#ifdef NSFoundationVersionNumber_iOS_9_x_Max
#import <UserNotifications/UserNotifications.h>
#endif
#import "mknetwork/tyrtchttpengine.h"
#import "RtcController.h"

//static NSString *appKey = @"14bdf0ddf096ac07559ffa24";     //JPSUH填写appkey
static NSString *appKey = @"7809e4354a9eb0895971b9e8";     //JPSUH填写appkey  安卓工控
static NSString *channel = nil;    //JPSUH填写channel   一般为nil
static BOOL isProduction = false;  //填写isProdurion  平时测试时为false ，生产时填写true
static NSString *APPLICATION_URL=nil;
//static NSString *smsAppKey=@"1bc067292dab6";
//static NSString *smsAppSecret=@"6039fe8854d8b74ef443d2f9571004cd";
static NSString *smsAppKey=@"1d9cf706e3a80";//安卓工控短信验证
static NSString *smsAppSecret=@"fe2e78b69637be9780872f6ed795cffd";

@interface AppDelegate : UIResponder <UIApplicationDelegate>
@property (nonatomic,strong) UIWindow *window;  //声明UIwindow对象属性
@property (nonatomic,strong) RtcController *rtcController; //声明一个对讲控制对象
@end
