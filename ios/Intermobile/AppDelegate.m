/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import <RCTJPushModule.h>
#ifdef NSFoundationVersionNumber_iOS_9_x_Max
#import <UserNotifications/UserNotifications.h>
#endif

// **********************************************
// *** DON'T MISS: THE NEXT LINE IS IMPORTANT ***
// **********************************************
#import "RCCManager.h"

#import "RCTBundleURLProvider.h"
#import "RCTRootView.h"
#import "RtcController.h"
#import "ReachabilityRTC.h"
#import <SMS_SDK/SMSSDK.h>

@interface AppDelegate()
{
  BOOL   firstCheckNetwork;
  ReachabilityRTC* hostReach;
  int lastStatus;
}
@end

@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  //初始化可视对讲控制器, 调试界面的时候需要屏蔽
  [self initRtcController];
  [SMSSDK registerApp:smsAppKey withSecret:smsAppSecret];
  //启动react native界面
  NSURL *jsCodeLocation;
  
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
  //jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  
  // **********************************************
  // *** DON'T MISS: THIS IS HOW WE BOOTSTRAP *****
  // **********************************************
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.backgroundColor = [UIColor whiteColor];
  [[RCCManager sharedInstance] initBridgeWithBundleURL:jsCodeLocation];
  
  //初始化极光推送部分
  if ([[UIDevice currentDevice].systemVersion floatValue] >= 10.0) {
    JPUSHRegisterEntity * entity = [[JPUSHRegisterEntity alloc] init];
    entity.types = UNAuthorizationOptionAlert|UNAuthorizationOptionBadge|UNAuthorizationOptionSound;
    [JPUSHService registerForRemoteNotificationConfig:entity delegate:self];
    
  } else if ([[UIDevice currentDevice].systemVersion floatValue] >= 8.0) {
    [JPUSHService registerForRemoteNotificationTypes:(UIUserNotificationTypeBadge |
                                                      UIUserNotificationTypeSound |
                                                      UIUserNotificationTypeAlert)
                                          categories:nil];
  } else {
    [JPUSHService registerForRemoteNotificationTypes:(UIRemoteNotificationTypeBadge |
                                                      UIRemoteNotificationTypeSound |
                                                      UIRemoteNotificationTypeAlert)
                                          categories:nil];
  }
  
  [JPUSHService setupWithOption:launchOptions appKey:appKey
                        channel:channel apsForProduction:isProduction];
  
  /*注释掉原来的打开窗口方法
   RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
   moduleName:@"Intermobile"
   initialProperties:nil
   launchOptions:launchOptions];
   rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
   
   self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
   UIViewController *rootViewController = [UIViewController new];
   rootViewController.view = rootView;
   self.window.rootViewController = rootViewController;
   [self.window makeKeyAndVisible];
   */
  
  return YES;
}

//------------可视对讲相关初始化方法-----------
- (void)initRtcController
{
  self.rtcController = [RtcController getInstance];//新建一个对讲控制对象
  initCWDebugLog(); //打开RTC的日志输出
  [self checkNetWorkReachability];//检测网络状况
  
  //注册本地推送
  if ([UIApplication instancesRespondToSelector:@selector(registerUserNotificationSettings:)]&&[[[UIDevice currentDevice]systemVersion]floatValue]>=8.0)
  {
    [[UIApplication sharedApplication] registerUserNotificationSettings:[UIUserNotificationSettings settingsForTypes:UIUserNotificationTypeAlert|UIUserNotificationTypeBadge|UIUserNotificationTypeSound categories:nil]];
    CWLogDebug(@"registerUserNotificationSettings");
  }
}

- (void)keepAlive
{
  [self.rtcController onAppEnterBackground];
}

//如果希望在后台仍能接收来电，必须实现后台重连机制
- (void)applicationDidEnterBackground:(UIApplication *)application
{
  //[self performSelectorOnMainThread:@selector(keepAlive) withObject:nil waitUntilDone:YES];
  //[application setKeepAliveTimeout:600 handler: ^{//后台托管
  //  [self performSelectorOnMainThread:@selector(keepAlive) withObject:nil waitUntilDone:YES];
  //}];
  
  [NSRunLoop currentRunLoop];
  if ([UIApplication instancesRespondToSelector:@selector(registerUserNotificationSettings:)])
  {
    [application setKeepAliveTimeout:600 handler: ^{//后台托管，回到前台仍有效
      [self performSelectorOnMainThread:@selector(keepAlive) withObject:nil waitUntilDone:YES];
    }];
  }
}

//回到前台后弹出来电界面
- (void)applicationWillEnterForeground:(UIApplication *)application
{
  [self.rtcController onApplicationWillEnterForeground:application]; //调用可视对讲控制类的相关进入前台方法
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
  [[UIApplication  sharedApplication] cancelAllLocalNotifications]; //清除所有本地的推送提示
  [self.rtcController onApplicationDidBecomeActive:application]; //调用可视对讲控制类的相关进入前台方法
}

#pragma mark - NetWorkReachability

-(void)checkNetWorkReachability
{
  firstCheckNetwork=YES;
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(reachabilityNetWorkStatusChanged:)
                                               name: kReachabilityChangedNotificationRTC
                                             object: nil];
  hostReach = [ReachabilityRTC reachabilityWithHostname:@"www.baidu.com"];
  [hostReach startNotifier];
}

- (void) reachabilityNetWorkStatusChanged: (NSNotification* )note
{
  
  ReachabilityRTC* curReach = [note object];
  int networkStatus = [curReach currentReachabilityStatus];
  NSLog(@"reachability Changed:%d.",networkStatus);
  
  if (networkStatus!=NotReachableRTC && firstCheckNetwork)
  {
    firstCheckNetwork=NO;
    lastStatus = networkStatus;
    return;
  }
  
  NSLog(@"lastStatus:%d,networkStatus:%d.",lastStatus,networkStatus);
  if((networkStatus == 0) || (networkStatus*lastStatus !=0))//断网，或wifi与移动数据之间切换，需要重连
    [self.rtcController onNetworkChanged:networkStatus];
  
  firstCheckNetwork=NO;
  lastStatus = networkStatus;
}

//------------JPUSH 相关初始化方法-----------
- (void)application:(UIApplication *)application
didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
[JPUSHService registerDeviceToken:deviceToken];
  }

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
  // 取得 APNs 标准信息内容
  
  [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:userInfo];
}
//iOS 7 Remote Notification
- (void)application:(UIApplication *)application didReceiveRemoteNotification:  (NSDictionary *)userInfo fetchCompletionHandler:(void (^)   (UIBackgroundFetchResult))completionHandler {
  
  [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:userInfo];
}

// iOS 10 Support
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(NSInteger))completionHandler {
  // Required
  NSDictionary * userInfo = notification.request.content.userInfo;
  if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    [JPUSHService handleRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:userInfo];
  }
  completionHandler(UNNotificationPresentationOptionAlert); // 需要执行这个方法，选择是否提醒用户，有Badge、Sound、Alert三种类型可以选择设置
}

// iOS 10 Support
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler {
  // Required
  NSDictionary * userInfo = response.notification.request.content.userInfo;
  if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    [JPUSHService handleRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:kJPFOpenNotification object:userInfo];
  }
  completionHandler();  // 系统要求执行这个方法
}


@end
