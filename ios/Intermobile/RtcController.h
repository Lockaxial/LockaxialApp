//
//  RtcController.h
//  Intermobile
//  可视对讲控制类声明
//  Created by 结点科技 on 2017/2/17.
//  Copyright © 2017年 Facebook. All rights reserved.
//
#import "RCTLog.h"
#import "sdkobj.h"
#import "tyrtchttpengine.h"
#import "MKNetworkOperationRTC.h"
#import "RCTBridgeModule.h"

static NSString *RTC_APP_ID = @"71012";
static NSString *RTC_APP_KEY =@"71007b1c-6b75-4d6f-85aa-40c1f3b842ef";
static NSString *RTC_TERMINAL_TYPE=@"Phone";
static NSString *RTC_APP_AGENT=@"Intermobile";
static NSString *APP_WEB_SERVER_URL=nil;
static NSString *LIFT_WIFI_SSID=@"CB_CTRL";
typedef enum EVENTID
{
  MSG_NEED_VIDEO = 3000,//创建视频
  MSG_SET_AUDIO_DEVICE = 3001,//设置扬声器
  MSG_SET_VIDEO_DEVICE = 3002,//切换摄像头
  MSG_HIDE_LOCAL_VIDEO = 3003,//隐藏本地窗口
  MSG_CALL_TIMEOUT = 3004,//隐藏本地窗口
  MSG_HANGUP = 3010,//挂断
  MSG_ACCEPT_VIDEO = 3011,//接听
  MSG_ACCEPT_VOICE = 3012,//接听
  MSG_REJECT = 3013,//拒接
  MSG_OPEN_DOOR = 3014,//开门
  MSG_OPEN_LOCK = 3015,//开门
  MSG_HANGUP_AND_OPEN=3016 //挂断并且开门
}eventid;


@interface RtcController : NSObject<SdkObjCallBackProtocol,AccObjCallBackProtocol,CallObjCallBackProtocol>

@property (nonatomic,retain) NSString *accountName;

-(void)setLog:(NSString*)log;
-(void)onApplicationWillEnterForeground:(UIApplication *)application;  //APP将进入前台，将调用该方法
-(void)onApplicationDidBecomeActive:(UIApplication *)application;
-(void)onAppEnterBackground; //APP将退入后台时将调用该方法
-(void)onNetworkChanged:(BOOL)netstatus; //网络发生变化时调用该方法
-(BOOL)accObjIsRegisted;  //检查RTC账户是否已经注册
-(void)login:(NSString*)username;
-(void)openLock:(NSString*) deviceKey unitNo:(NSString*)unitNo;
-(void)openTalk:(NSString*) deviceKey;
-(void)unRegister;
-(void)sendMessageToReact:(NSString*)eventName notification:(NSNotification *)notification; //给React发送消息

+(RtcController *)getInstance;
+(void)setApplicationUrl:(NSString*)url;
+(NSString*)getApplicationUrl;
@end
