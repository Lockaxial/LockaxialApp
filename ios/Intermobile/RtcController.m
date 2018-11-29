//
//  RtcController.m
//  Intermobile
//  可视对讲控制类实现
//  Created by 结点科技 on 2017/2/17.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <AudioToolbox/AudioToolbox.h>
#import <AVFoundation/AVFoundation.h>
#import <SystemConfiguration/CaptiveNetwork.h>
#import <AVFoundation/AVCaptureSession.h>

#import "RtcController.h"
#import "JSONKitRTC.h"
#import "sdkobj.h"
#import "sdkkey.h"
#import "sdkerrorcode.h"
#import "CallController.h"
#import "TalkController.h"
#import "ReactBridge.h"

static int cameraIndex = 1;//切换摄像头索引，1为前置，0为后置
static int RTC_ACCOUNT_TYPE=10; //RTC账号体系是APP的自己的账户
static RtcController *_INSTANCE=nil;

@interface RtcController() //定义视频通话控制器内部成员变量
{
  SdkObj* sdkObj; //可视对讲SDK对象
  AccObj* accObj; //可视对讲账户对象
  CallObj* callObj; ////可视对讲呼叫对象
  
  BOOL isGettingToken;//正在获取token时不能重复获取
  BOOL isAutoRotationVideo;//是否自动适配本地采集的视频,使发送出去的视频永远是人头朝上
  
  NSString *token;//缓存token
  NSString *accountID;//获取token返回的accountid
  
  char callStatus;
  
  CallController *callController;
  TalkController *talkController;
  int speakerFlag;
}

@property (nonatomic,copy) NSString *callFrom;
@property (nonatomic,copy) NSString *imageUuid;
@property (nonatomic,copy) NSString *imageUrl;
@property (nonatomic,strong) AVAudioPlayer *ringingPlayer;

@end

@implementation RtcController

@synthesize ringingPlayer;
@synthesize accountName;

//----------与react native通信桥梁----

//@synthesize bridge = _bridge;
/*
 RCT_EXPORT_MODULE(ReactBridge);
 
 RCT_EXPORT_METHOD(sendMainMessage:(int)code parameter:(NSString *)parameter)
 {
 RCTLogInfo(@"ReactBridge ------>try to send Main Service<------- %d and %@", code, parameter);
 if(code==10000) //设置URL地址
 {
 [RtcController setApplicationUrl:parameter];
 }
 else if(code==10001) //设置用户账户，并且开始登录RTC
 {
 [self setLog:@"获取到React登录账户，初始化RTC"];
 [self login:parameter];
 }
 else if(code==10002) //退出登录
 {
 [self unRegister];
 }
 else if(code==40001) //检测RTC状态
 {
 int rtcCode=0;
 //if (self.sdkObj && [self.sdkObj isInitOk] && self.accObj && [self.accObj isRegisted])
 if([self accObjIsRegisted])
 {
 rtcCode=10;
 }
 [self sendMessageToReact:@"changeRtcStatus" notification:@{@"rtcStatus":[NSNumber numberWithInt:(rtcCode)]}];
 }
 else if(code==20033) //直接打开门襟设备
 {
 [self openLock:parameter];
 }
 }
 */

- (void)sendMessageToReact:(NSString*)eventName notification:(NSNotification *)notification
{
  //[self.bridge.eventDispatcher sendAppEventWithName:eventName body:notification];
  [ReactBridge sendMessage:eventName notification:notification];
}
//------------短信验证方法------------
/*
 RCT_EXPORT_METHOD(sendSms:(NSString *)phone)
 {
 RCTLogInfo(@"ReactBridge ------>try to send SMS to<------- %@", phone);
 [SMSSDK getVerificationCodeByMethod:SMSGetCodeMethodSMS phoneNumber:phone
 zone:@"86"
 customIdentifier:nil
 result:^(NSError *error){
 if (!error) {
 [self sendMessageToReact:@"sendSmsSuccess" notification:nil];
 } else {
 [self sendMessageToReact:@"sendSmsFail" notification:nil];
 }
 }];
 }
 
 RCT_EXPORT_METHOD(verifySms:(NSString *)phone code:(NSString*)code)
 {
 RCTLogInfo(@"ReactBridge ------>try to send SMS to<------- %@", phone);
 [SMSSDK getVerificationCodeByMethod:SMSGetCodeMethodSMS phoneNumber:phone
 zone:@"86"
 customIdentifier:nil
 result:^(NSError *error){
 if (!error) {
 [self sendMessageToReact:@"verifySmsSuccess" notification:nil];
 } else {
 [self sendMessageToReact:@"verifySmsFail" notification:nil];
 }
 }];
 }
 */
//------------可视对讲初始化-----------
//开始进行初始化

//从缓存中获取token
-(void)initToken
{
  NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
  
  token = [userDefaults objectForKey:@"RTC_TOKEN"];
  accountID = [userDefaults objectForKey:@"RTC_ACCOUNT_ID"];
  if(token)
  {
    [self setLog:[NSString stringWithFormat:@"获得缓存的token=%@",token]];
    NSDate *saveDate=[userDefaults objectForKey:@"RTC_TIME"];
    if(saveDate)
    {
      double timezoneFix = [NSTimeZone localTimeZone].secondsFromGMT;
      int days=(int)(([[NSDate date] timeIntervalSince1970] + timezoneFix)/(24*3600))
      -(int)(([saveDate timeIntervalSince1970] + timezoneFix)/(24*3600));
      if(days>28)
      {
        [self setLog:[NSString stringWithFormat:@"缓存token%@已经过期",token]];
        token=nil;
        accountID=nil;
      }
    }
    else
    {
      token=nil;
      accountID=nil;
    }
  }
}

-(void)saveToken
{
  [self setLog:[NSString stringWithFormat:@"将token%@存入缓存",token]];
  NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
  [userDefaults  setObject:token  forKey:@"RTC_TOKEN"];
  [userDefaults  setObject:accountID  forKey:@"RTC_ACCOUNT_ID"];
  [userDefaults  setObject:[NSDate date]  forKey:@"RTC_TIME"];
  [userDefaults synchronize];
}

//删除缓存的token
-(void)clearToken
{
  [self setLog:[NSString stringWithFormat:@"将token%@缓存删除",token]];
  NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
  [userDefaults removeObjectForKey:@"RTC_TOKEN"];
  [userDefaults removeObjectForKey:@"RTC_ACCOUNT_ID"];
  [userDefaults removeObjectForKey:@"RTC_TIME"];
  [userDefaults synchronize];
}

- (void)onInit
{
  dispatch_queue_t queue = dispatch_get_main_queue();
  dispatch_async(queue, ^{
    [self initSdkObject];//初始化SDK对象
  });
}

//初始化RTC SDK对象
- (void)initSdkObject
{
  [self setLog:@"开始进行初始化rtc"];
  if(isGettingToken) //如果系统正在获取token状态则直接退出，否则进入初始化过程
  {
    [self setLog:@"检查已经在进行初始化rtc，退出等待"];
    return;
  }
  isGettingToken=YES;
  speakerFlag=0;
  callStatus='N';
  [self initToken];
  [self setLog:@"初始化rtc"];
  if (sdkObj && [sdkObj isInitOk])
  {
    //若sdk已成功初始化，请不要重复创建，更不要频繁重复向RTC平台发送请求
    [self setLog:@"已初始化成功,无需重复创建"];
    [self initAccountObject];
    return;
  }
  [self setLog:@"创建RTC SDK对象"];
  signal(SIGPIPE, SIG_IGN);
  sdkObj = [[SdkObj alloc]init];//创建sdkobj指针
  
  //设置sdk基础信息，在此传入您在RTC平台申请的AppId和AppKey，
  //demo中的AppId和AppKey只用于测试，不可用于应用的正式发布使用，
  //APP_USER_AGENT参数应用自定义，一般传入应用名称即可
  //UDID传入[OpenUDID value]即可
  [sdkObj setSdkAgent:RTC_APP_AGENT terminalType:RTC_TERMINAL_TYPE UDID:[OpenUDIDRTC value] appID:RTC_APP_ID appKey:RTC_APP_KEY];
  [sdkObj setDelegate:self];//必须设置回调代理，否则无法执行回调
  [self doNavigation];
}

-(void)doNavigation
{
  [sdkObj doNavigation:@"default"];//参数传入@"default"即可，采用平台默认地址，会在onNavigationResp回调
}

//创建RTC账户对象
-(void)initAccountObject
{
  if (!accObj)//当账户对象为空，则创建对象
  {
    [self setLog:@"创建RTC账户对象"];
    accObj = [[AccObj alloc]init];//创建accobj
    [accObj bindSdkObj:sdkObj];//必须与sdkobj绑定
    [accObj setDelegate:self];//必须设置回调代理，否则无法执行回调
    if(!token)
    {
      [self connectToRtcServer]; //获取token，并且再次连接
    }
    else
    {
      [self registerToRtcServer]; //如果之前已经获取到token则直接进行注册
    }
  }else if ([accObj isRegisted]) //如果已经是注册状态，则进行登录刷新
  {
    isGettingToken = NO;
    [self setLog:@"登录刷新"];
    [accObj doRegisterRefresh];
  }
  else
  {
    [self setLog:@"重新发起登录动作"];
    if(!token)
    {
      [self connectToRtcServer]; //获取token，并且再次连接
    }
    else
    {
      [self registerToRtcServer]; //如果之前已经获取到token则直接进行注册
    }
    
  }
  
}

//连接RTC服务器，并且获得token
- (void)connectToRtcServer
{
  [self setLog:@"连接RTC服务器，准备获取token"];
  //此句getToken代码为临时做法，开发者需参考文档通过第三方应用平台获取token，不要通过此接口获取
  //获取到返回结果后，请调用doAccRegister接口进行注册，传入参数为服务器返回的结构
  //请在应用层做好token的缓存，不要重复获取token，除非token失效才需重新获取
  //在后面的onRegisterResponse方法中回调返回结果
  [accObj getToken:accountName andType:RTC_ACCOUNT_TYPE andGrant:@"100<200<301<302<303<304<400" andAuthType:ACC_AUTH_TO_APPALL];
}

//获得token后注册到RTC服务器
- (void)registerToRtcServer
{
  if(token){
    [self setLog:@"连接RTC服务器，并且进行注册"];
    NSMutableDictionary *newResult = [NSMutableDictionary dictionaryWithObjectsAndKeys:nil];
    [newResult setObject:token forKey:KEY_CAPABILITYTOKEN];
    [newResult setObject:accountID forKey:KEY_RTCACCOUNTID];//形如"账号类型-账号~appid~终端类型@chinartc.com"
    int resultCode=[accObj doAccRegister:newResult];//注册账户
  }
}

-(void)registerCompleted
{
  [self setLog:@"RTC注册成功"];
  isGettingToken = NO;
  [self sendMessageToReact:@"changeRtcStatus" notification:@{@"rtcStatus": @10}];
  [self initEventHandler];
}

//取消注册
- (void)unRegister
{
  //切换账号前，需先将当前账号注销，释放accobj，然后再发起新的登录操作
  [self clearToken];
  if (accObj)
  {
    [accObj doUnRegister];
    accObj = nil;
    isGettingToken=NO;
    token=nil;
    accountID=nil;
  }
  if(sdkObj)
  {
    sdkObj = nil;
  }
  [self setLog:@"注销完毕"];
}


//------------RTC事件回调--------
//所有SDK回调都需要应用层在主线程实现，若某些回调应用层不需要调用，实现一个空的函数体即可

//获取服务器地址结果回调
-(void)onNavigationResp:(int)code error:(NSString*)error
{
  [self setLog:[NSString stringWithFormat:@"Navigation 反馈信息--%d",code]];
  if (0 == code)
  {
    [self setLog:[NSString stringWithFormat:@"SDK初始化成功"]];
    
    //音视频编解码以及分辨率可以不设置，若不设置则采用默认配置
    [sdkObj setAudioCodec:[NSNumber numberWithInt:1]];//iLBC
#if (SDK_HAS_VIDEO>0)
    [sdkObj setVideoCodec:[NSNumber numberWithInt:1]];//VP8
    [sdkObj setVideoAttr:[NSNumber numberWithInt:3]];//CIF
#endif
    //开发者可以将初始化和登录分开进行，
    //demo是将初始化和登录合并为一个button进行，因此在此处进行登录
    //请在初始化成功之后再进行登录，不要在尚未获得初始化返回结果时就登录
    [self initAccountObject]; //初始化Account Object对象
  }
  else
  {
    //常见错误：初始化失败-1002，请检查网络是否正常，以及appID、appKey、address参数是否传入正确
    [self setLog:[NSString stringWithFormat:@"SDK初始化失败:%d,%@",code,error]];
    if(sdkObj)
    {
      sdkObj = nil;
    }
    isGettingToken = NO;
    [self performSelector:@selector(initSdkObject) withObject:nil afterDelay:0.5f];
  }
}

//注册结果回调
//result形如：
//{
//    capabilityToken = CB568F38A1EF6B4B9B17CB5EA749156C;
//    code = 0;
//    currentUserTerminalSN = "<null>";
//    currentUserTerminalType = "<null>";
//    reason = "\U7533\U8bf7\U6210\U529f";
//    requestId = "2015-10-28 13:15:45:045";
//    rtcaccountID = "10-1111~70038~Phone@chinartc.com";
//}
-(int)onRegisterResponse:(NSDictionary*)result  accObj:(AccObj*)accObj
{
  NSString* thisToken = [result objectForKey:KEY_CAPABILITYTOKEN];
  NSString* thisAccountID = [result objectForKey:KEY_RTCACCOUNTID];
  if(!token)
  {
    [self setLog:[NSString stringWithFormat:@"Register 获取新的token--%@--%@",thisToken,thisAccountID]];
    token = thisToken;
    accountID = thisAccountID;
    if(token)
    {
      [self saveToken];
      [self registerToRtcServer];
      return EC_OK;
    }else{
      //TODO
      //隔半秒时间后重新获取token
      [self performSelector:@selector(connectToRtcServer) withObject:nil afterDelay:0.5f];
      return EC_OK;
    }
  }
  else
  {
    if(!thisToken){
      [self registerCompleted];
    }
    return EC_OK;
  }
}

//用户在线状态查询结果回调
//result形如：
//{
//    code = 0;
//    reason = "\U67e5\U8be2\U6210\U529f";
//    requestId = "2015-10-28 13:19:57:057";
//    userStatusList =     (
//                          {
//                              appAccountId = "10-1117~70038~Any";
//                              othOnlineInfoList = "<null>";
//                              presenceTime = "2015-10-28-13-19-55";
//                              status = 1;
//                          }
//                          );
//}
-(int)onAccStatusQueryResponse:(NSDictionary*)result accObj:(AccObj*)accObj
{
  if (nil == result || nil == accObj)
  {
    [self setLog:@"查询请求失败-未知原因"];
    return EC_PARAM_WRONG;
  }
  id obj = [result objectForKey:KEY_RESULT];
  if (nil == obj)
  {
    [self setLog:@"查询请求失败-丢失字段KEY_RESULT"];
    return EC_PARAM_WRONG;
  }
  int code = [obj intValue];
  if (0 == code)
  {
    int i = 0;//获取第i个账号的在线状态
    while (TRUE)
    {
      int online = 0;
      NSString* sAccId = [accObj getUserStatus:result online:&online atIndex:i];//获取在线状态
      if (nil != sAccId)
      {
        [self setLog:[NSString stringWithFormat:@"%@_%@",online?@"在线":@"离线",sAccId]];
        i++;
      }
      else
      {
        break;
      }
      
    }
  }
  else
  {
    NSString* reason = [result objectForKey:KEY_REASON];
    [self setLog:[NSString stringWithFormat:@"查询失败:%d:%@",code,reason]];
  }
  return EC_OK;
  
}

//点对点来点回调
//param形如：
//{
//    "call.er" = "10-18910903997~70038~Phone";
//    "call.type" = 1;
//    "ci" = "custom";
//}
//APP不主动接收视频呼叫
-(int)onCallIncoming:(NSDictionary*)param withNewCallObj:(CallObj*)newCallObj accObj:(AccObj*)accObj
{
  return 0;
}

//呼叫事件回调
-(int)onCallBack:(SDK_CALLBACK_TYPE)type code:(int)code callObj:(CallObj*)callObj
{
  [self setLog:[NSString stringWithFormat:@"呼叫事件:%d code:%d",type,code]];
  //常见呼叫code码含义：
  //404：呼叫的账号不存在，主被叫appid可能不一致
  //408：本地或对端网络异常
  //480：被叫未登录，或网络断开了
  //487：发起呼叫后被叫网络断开，或是通话过程中对端挂断，或是收到来电后主叫挂断。
  //603：发起呼叫后被叫挂断，或是收到来电后主叫网络断开
  
  //不同事件类型见SDK_CALLBACK_TYPE
  if(type == SDK_CALLBACK_RING) //正在呼叫
  {
    [self setLog:[NSString stringWithFormat:@"呼叫中%d...",code]];
  }
  else if (type == SDK_CALLBACK_ACCEPTED) //对方接受了呼叫
  {
    
  }
  else //呼叫失败，关闭呼叫页面
  {
    [self onCallFailed];
  }
  return 0;
}

-(void)onCallFailed
{
  if(callController)
  {
    [self sendMessageToReact:@"onCallFailed" notification:nil];
    [self closeCallingView];
  }
  else if(talkController)
  {
    [self sendMessageToReact:@"onTalkFailed" notification:nil];
    [self closeTalkingView];
  }
}

//呼叫媒体建立事件通知
-(int)onCallMediaCreated:(int)mediaType callObj:(CallObj *)callObj
{
  [callObj doSwitchAudioDevice:SDK_AUDIO_OUTPUT_DEFAULT];
  if (mediaType == MEDIA_TYPE_VIDEO)
  {
    if(callController)
    {
      int ret = [callObj doSetCallVideoWindow:callController.remoteVideoView localVideoWindow:(void *)callController.localVideoView];//第一个参数必须为IOSDisplay*类型
    }
    else if(talkController)
    {
      [talkController onCalling:true];
      int ret = [callObj doSetCallVideoWindow:talkController.remoteVideoView localVideoWindow:(void *)talkController.localVideoView];
    }
  }else{
    if(talkController)
    {
      [talkController onCalling:false];
    }
  }
  [self setCallIncomingFlag:NO];
  return 0;
}

//呼叫网络状态事件通知，仅限点对点视频
-(int)onNetworkStatus:(NSString*)desc callObj:(CallObj*)callObj
{
  return 0;
}

//消息到达回调
//param形如:
//{
//    "call.er" = "10-1446013949~70038~Browser";
//    "call.type" = "text/plain";
//    ci = "123";
//}
//接收到实时消息
-(int)onReceiveIM:(NSDictionary*)param withAccObj:(AccObj*)accObj
{
  [self setLog:[NSString stringWithFormat:@"接收到消息:%@，其中参数为：%@",param,accObj]];
  NSString* mime = [param objectForKey:KEY_CALL_TYPE];
  NSString* from = [param objectForKey:KEY_CALLER];
  NSString* content = [param objectForKey:KEY_CALL_INFO];//消息内容
  [self setLog:[NSString stringWithFormat:@"接收消息主要内容是:%@",content]];
  
  NSDictionary *msg = nil;
  NSString* command=@"";
  NSString* unitName=@"";
  NSString* imageUrl=@"";
  NSString* imageUuid=@"";
  NSString* communityName=@"";
  NSString* lockName=@"";
  NSString* deviceKey=@"";
  
  @try
  {
    msg = [content objectFromJSONString];
    command=[msg objectForKey:@"command"];
    deviceKey=[msg objectForKey:@"from"];
    imageUrl=[msg objectForKey:@"imageUrl"];
    imageUuid=[msg objectForKey:@"imageUuid"];
    communityName=[msg objectForKey:@"communityName"];
    lockName=[msg objectForKey:@"lockName"];
  }
  @catch
  (NSException *exception) {
  }
  
  if ([command isEqualToString:@"call"])
  {
    self.callFrom=deviceKey;
    self.imageUuid=imageUuid;
    self.imageUrl=imageUrl;
    [self onCallFromDevice:deviceKey lockName:lockName imageUrl:imageUrl]; //响应从设备端过来的呼叫
  }
  else if ([command isEqualToString:@"appendImage"])
  {
    if([deviceKey isEqualToString:self.callFrom]&&[imageUuid isEqualToString:self.imageUuid]){
      self.imageUrl=imageUrl;
      [self appendCallImage:imageUrl]; //更新呼叫图片
    }
  }
  else if([command isEqualToString:@"cancelCall"])
  {
    [self setLog:[NSString stringWithFormat:@"取消呼叫:%@",deviceKey]];
    [self setLog:[NSString stringWithFormat:@"现在的呼叫为:%@",self.callFrom]];
    if([deviceKey isEqualToString:self.callFrom]){
      [self cancelCallFromDevice]; //取消从设备端的呼叫，通常是由其他人接听
    }
  }
  else if([command isEqualToString:@"useCoupon"])
  {
    NSString* couponId=[msg objectForKey:@"couponId"];
    [self sendMessageToReact:@"useCoupon" notification:@{@"couponId":couponId}];
  }
  else
  {
    [self sendMessageToReact:command notification:nil];
  }
  return 0;
}

//消息发送回调
-(int)onSendIM:(int)status
{
  [self setLog:[NSString stringWithFormat:@"发送消息:%d",status]];//200为成功
  if(status==200)
  {
    [self sendMessageToReact:@"reactSendImSuccess" notification:nil];
  }
  else
  {
    [self sendMessageToReact:@"reactSendImFailed" notification:nil];
  }
  return 0;
}


#pragma mark - LocalNotification delegates
#define CALL_INCOMING_FLAG  @"CALL_INCOMING_FLAG"
-(BOOL)isBackground
{
  return [[UIApplication sharedApplication] applicationState] == UIApplicationStateBackground
  ||[[UIApplication sharedApplication] applicationState] == UIApplicationStateInactive;
}

//标志后台来电中的状态
-(void)setCallIncomingFlag:(BOOL)reg
{
  [[NSUserDefaults standardUserDefaults]setObject:[NSNumber numberWithBool:reg] forKey:CALL_INCOMING_FLAG];
}

-(BOOL)getCallIncomingFlag
{
  id obj = [[NSUserDefaults standardUserDefaults]objectForKey:CALL_INCOMING_FLAG];
  if (obj)
  {
    return [obj boolValue];
  }
  return NO;
}

-(void)reinitSdk
{
  if(isGettingToken) //如果系统正在获取token状态则直接退出，否则进入初始化过程
  {
    [self setLog:@"重新初始化，检查已经在进行，退出等待"];
    return;
  }
  [self sendMessageToReact:@"changeRtcStatus" notification:@{@"rtcStatus":[NSNumber numberWithInt:0]}];
  [self unRegister];
  [self onInit];
}

//应用变成Active状态
-(void)onApplicationDidBecomeActive:(UIApplication *)application
{
}

//应用从后台切换到前台时，若有来电则弹出来电界面
- (void)onApplicationWillEnterForeground:(UIApplication *)application
{
  if (!sdkObj || ![sdkObj isInitOk] || !accObj || ![accObj isRegisted])
  {
    [self setLog:@"APP进入前台后，检测RTC不正常，重新初始化"];
    [self reinitSdk];
    return;
  }
  else
  {
    [self setLog:@"APP进入前台后，检测RTC正常"];
    [self sendMessageToReact:@"changeRtcStatus" notification:@{@"rtcStatus":[NSNumber numberWithInt:10]}];
  }
  
  if ([self getCallIncomingFlag])
  {
    [self setCallIncomingFlag:NO];
    int callType = [[[NSUserDefaults standardUserDefaults]objectForKey:KEY_CALL_TYPE]intValue];
    
    //延时等待应用唤醒后，再创建界面
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5*NSEC_PER_SEC)),dispatch_get_main_queue(),^
                   {
                     //TODO, 当切换到前台，打开来电界面
                     //                     CCallingViewController* view1 = [[CCallingViewController alloc]init];
                     //                     view1.isVideo = !(callType == AUDIO || callType == AUDIO_RECV || callType == AUDIO_SEND);
                     //                     view1.isCallOut = NO;
                     //
                     //                     if (view1.isVideo)
                     //                     {
                     //                       view1.isAutoRotate = isAutoRotationVideo;
                     //                     }
                     //
                     //                     view1.view.frame = self.view.frame;
                     //                     [callingView release];
                     //                     callingView = view1;
                     //                     [callingView retain];
                     //                     [self presentViewController:view1 animated:NO completion:nil];
                     //                     [view1 release];
                   });
  }
}

//后台重连，保持长连接
-(void)onAppEnterBackground
{
  [self setLog:[NSString stringWithFormat:@"APP退入后台，检查SDK%@",accObj]];
  if (!sdkObj || ![sdkObj isInitOk] || !accObj || ![accObj isRegisted])
  {
    [self setLog:@"APP退入后台，检测RTC不正常，重新初始化"];
    [self initSdkObject];
    return;
  }
  [sdkObj onAppEnterBackground];//SDK长连接
}

-(void)onNetworkChanged:(BOOL)netstatus
{
  if(netstatus)
  {
    [self setLog:@"网络状态变为正常，重新初始化"];
    [self reinitSdk]; //注销原来的账户
    [sdkObj onAppEnterBackground];//网络恢复后进行重连
  }
  else
  {
    [self setLog:@"网络不可用"];
    [sdkObj onNetworkChanged];//网络断开后销毁网络数据
    if(callObj)//通话被迫结束，销毁通话界面
    {
      NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:@"", @"params",
                              [NSNumber numberWithInt:MSG_HANGUP],@"msgid",
                              [NSNumber numberWithInt:0],@"arg",
                              nil];
      [[NSNotificationCenter defaultCenter]  postNotificationName:@"RTC_NOTIFY_EVENT" object:nil userInfo:params];
    }
    [self sendMessageToReact:@"changeRtcStatus" notification:@{@"rtcStatus":[NSNumber numberWithInt:0]}];
  }
}

-(BOOL)accObjIsRegisted
{
  if (accObj && [accObj isRegisted])
    return  YES;
  return NO;
}

//------------其他部分-----------
//可视对讲控制器删除的时候，释放内存资源
- (void)dealloc
{
  [NSObject cancelPreviousPerformRequestsWithTarget:self];
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

//日志输出
-(void)setLog:(NSString*)log
{
  NSDateFormatter *dateFormat=[[NSDateFormatter alloc] init];
  [dateFormat setDateFormat:@"HH:mm:ss"];
  NSString* datestr = [dateFormat stringFromDate:[NSDate date]];
  CWLogDebug(@"RTC SDK:%@:%@",datestr,log);
}

//------------消息处理部分-----------
//在RTC账户注册完成后，调用此方法初始化消息事件处理
- (void) initEventHandler
{
  //    NSNotificationCenter在post消息后，会一直调用函数中会一直等待被调用函数执行完全，
  //    然后返回控制权到主函数中，再接着执行后面的功能。即：这是一个同步阻塞的操作。
  //    如果要想不等待，直接返回控制权，可以采用NSNotificationQueue。
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(onEventHandler:)
                                               name:@"RTC_NOTIFY_EVENT"
                                             object:nil];
}

//事件响应控制，处理外部或者内部发送来的消息事件，并进行下一步处理
-(void)onEventHandler:(NSNotification *)notification
{
  if (nil == notification)
  {
    [self setLog:@"wrong notification"];
    return;
  }
  if (nil == [notification userInfo])
  {
    [self setLog:@"wrong notification param"];
    return;
  }
  NSDictionary *data=[notification userInfo];
  int msgid = [[data objectForKey:@"msgid"]intValue];
  
  if (MSG_SET_AUDIO_DEVICE == msgid)//切换麦克
  {
    [self switchMic];
  }
  else if (MSG_HANGUP == msgid)//挂断
  {
    [self hangUp];
  }
  else if (MSG_REJECT == msgid)//拒接
  {
    [self rejectCall];
  }
  else if (MSG_ACCEPT_VOICE == msgid)//接听音频
  {
    [self openRtc:'A'];
  }
  else if (MSG_ACCEPT_VIDEO == msgid)//接听视频
  {
    [self openRtc:'V'];
  }
  else if (MSG_OPEN_DOOR==msgid) //开门
  {
    [self openDoor];
  }
  else if(MSG_HANGUP_AND_OPEN==msgid) //开门并且关闭对话
  {
    [self openDoorAndHangup];
  }
  else if(MSG_CALL_TIMEOUT==msgid)
  {
    if(callStatus=='N')
    {
      [self rejectCall];
    }
  }
}

//更新呼叫图片
-(void)appendCallImage:(NSString*)imageUrl
{
  if(callController){
    [callController appendCallImage:imageUrl];  //更新呼叫图片
  }
}

//呼叫门襟设备
-(void)onCallFromDevice:(NSString*) deviceKey lockName:(NSString*)lockName imageUrl:(NSString*)imageUrl
{
  [self openCallingView:lockName imageUrl:imageUrl];  //打开呼叫界面
  [self startRing];  //开启铃声
}

//停止呼叫门襟设备，关闭呼叫窗口
-(void)cancelCallFromDevice
{
  [self stopRing];
  [self closeCallingView];
}

//切换麦克风
-(void)switchMic
{
  if(!callObj)
  {
    [self setLog:@"切换放音设备前请先呼叫"];
    return;
  }
  
  if(speakerFlag==0)
  {
    speakerFlag=1;
  }
  else
  {
    speakerFlag=0;
  }
  if(speakerFlag == 1)
  {
    [callObj doSwitchAudioDevice:SDK_AUDIO_OUTPUT_SPEAKER];
    [self setLog:@"放音设备切换到外放"];
  }
  else
  {
    [callObj doSwitchAudioDevice:SDK_AUDIO_OUTPUT_DEFAULT];
    [self setLog:@"放音设备切换到听筒/耳机"];
  }
}

////切换摄像头
//-(void)switchCamera
//{
//  if (!callObj)
//  {
//    [self setLog:@"切换摄像头前请先呼叫"];
//    return;
//  }
//  cameraIndex++;
//  if (cameraIndex > 1)
//  {
//    cameraIndex = 0;
//  }
//  [callObj doSwitchCamera:cameraIndex];
//  [self setLog:[NSString stringWithFormat:@"摄像头切换到:%d",cameraIndex]];
//}

////隐藏本地摄像头
//-(void)hideLocalCamera:(int)arg
//{
//  if (!callObj || callObj.CallMedia!= MEDIA_TYPE_VIDEO)
//  {
//    [self setLog:@"隐藏摄像头前请先呼叫"];
//    return;
//  }
//  [callObj doHideLocalVideo:(SDK_HIDE_LOCAL_VIDEO)arg];
//}

//打开来电提示声音
-(void)startRing
{
  //在这里增加去电振铃音
  NSString * musicFilePath = [[NSBundle mainBundle] pathForResource:@"ring" ofType:@"mp3"];      //创建音乐文件路径
  NSURL * musicURL= [[NSURL alloc] initFileURLWithPath:musicFilePath];
  ringingPlayer  = [[AVAudioPlayer alloc] initWithContentsOfURL:musicURL error:nil];
  //创建播放器
  [ringingPlayer setVolume:1.0];   //设置音量大小
  ringingPlayer.numberOfLoops = 1;//设置音乐播放次数  -1为一直循环
  if([ringingPlayer prepareToPlay])
  {
    [ringingPlayer play];
  }
}

//停止来电提示声音
-(void)stopRing
{
  if(ringingPlayer)
  {
    if([ringingPlayer isPlaying])
    {
      [ringingPlayer stop];
      [[AVAudioSession sharedInstance] setActive:NO error:nil];
      ringingPlayer = nil;
    }
  }
}

//打开可视对讲
-(void)openRtc:(char)type
{
  [self stopRing];
  if(callStatus=='N'){
    callStatus='C';
    
    callObj = [[CallObj alloc]init];
    [callObj setDelegate:self];
    [callObj bindAcc:accObj];
    int ret = -1;
    SDK_CALLTYPE callType = (type=='V')?AUDIO_VIDEO:AUDIO;
    callObj.CallMedia=(type=='V')? MEDIA_TYPE_VIDEO:MEDIA_TYPE_AUDIO;
    NSDictionary* dic = [NSDictionary dictionaryWithObjectsAndKeys:
                         self.callFrom,KEY_CALLED,
                         [NSNumber numberWithInt:callType],KEY_CALL_TYPE,
                         [NSNumber numberWithInt:ACCTYPE_APP],KEY_CALL_REMOTE_ACC_TYPE,
                         TERMINAL_TYPE_PHONE,KEY_CALL_REMOTE_TERMINAL_TYPE,
                         @"",KEY_CALL_INFO,
                         nil];
    CWLogDebug(@"doMakeCall Param:%@",dic);
    ret = [callObj doMakeCall:dic];
  }
}

//挂断呼叫
-(void)hangUp
{
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5*NSEC_PER_SEC)),dispatch_get_main_queue(),^{
    if (callObj)
    {
      [callObj doHangupCall];
      callObj = nil;
    }
  });
  
  cameraIndex = 1;
  if(callController)
  {
    [self closeCallingView];
  }
  else if(talkController)
  {
    [self closeTalkingView];
  }
  
  [self setLog:@"呼叫挂断"];
  return;
}

//拒绝接听
-(void)rejectCall
{
  [self stopRing];
  [self closeCallingView];
  if (callObj)
  {
    [callObj doRejectCall];
    callObj = nil;
  }
}

//开门
-(void)openDoor
{
  [self stopRing];
  [self closeCallingView];
  NSString* message=@"open the door";
  if(self.imageUrl && [self.imageUrl length]>0)
  {
    message=[@"open the door-" stringByAppendingString:self.imageUrl];
  }
  [self sendMessageToDevice:self.callFrom message:message];
}
//开门并且挂断对讲
-(void)openDoorAndHangup
{
  NSString* message=@"open the door";
  if(self.imageUrl && [self.imageUrl length]>0)
  {
    message=[@"open the door-" stringByAppendingString:self.imageUrl];
  }
  [self sendMessageToDevice:self.callFrom message:message];
  [self hangUp];
}

//发送指令到设备
-(void)sendMessageToDevice:(NSString*) from message:(NSString*) message
{
  NSDictionary* dic = [NSDictionary dictionaryWithObjectsAndKeys:
                       from,KEY_CALLED,
                       @"cmd/json",KEY_CALL_MIME,
                       [NSNumber numberWithInt:ACCTYPE_APP],KEY_CALL_REMOTE_ACC_TYPE,
                       TERMINAL_TYPE_PHONE,KEY_CALL_REMOTE_TERMINAL_TYPE,
                       message,KEY_CALL_INFO,
                       nil];
  
  [self setLog:[NSString stringWithFormat:@"发送消息参数：%@",dic]];
  int code=[accObj doSendIM:dic];
  [self setLog:[NSString stringWithFormat:@"发送消息结果：%d",code]];
}

//手机APP直接发过来的开锁指令
-(void)openLock:(NSString*) deviceKey unitNo:(NSString*)unitNo
{
  NSString* message=@"";
  if(unitNo!=nil)
  {
    message = [message stringByAppendingFormat:@"%@-%@",@"open the door",unitNo];
  }
  else
  {
    message=@"open the door";
  }
  [self sendMessageToDevice:deviceKey message:message];
}

//手机APP呼叫室内机
-(void)openTalk:(NSString*) deviceKey
{
  self.callFrom=deviceKey;
  [self openTalkingView]; //打开对讲界面
}

//关闭对讲页面
-(void)closeTalkingView
{
  callStatus='N';
  if(talkController){
    UIViewController * rootViewController=[self getCurrentViewController];
    [rootViewController dismissViewControllerAnimated:YES completion:^{
      talkController=nil;
    }];
  }
}

//打开对讲页面
-(void)openTalkingView
{
  dispatch_queue_t queue = dispatch_get_main_queue();
  dispatch_async(queue, ^{
    talkController = [[TalkController alloc]init];
    UIViewController * rootViewController=[self getCurrentViewController];
    [rootViewController presentViewController:talkController animated:YES completion:^{
      //[talkController onCalling:lockName imageUrl:imageUrl];
      [self openRtc:'V'];
    }];
  });
}

//关闭呼叫页面
-(void)closeCallingView
{
  callStatus='N';
  if(callController){
    UIViewController * rootViewController=[self getCurrentViewController];
    [rootViewController dismissViewControllerAnimated:YES completion:^{
      callController=nil;
    }];
  }
}

//打开呼叫页面
-(void)openCallingView:(NSString*)lockName imageUrl:(NSString*)imageUrl
{
  dispatch_queue_t queue = dispatch_get_main_queue();
  dispatch_async(queue, ^{
    callController = [[CallController alloc]init];
    UIViewController * rootViewController=[self getCurrentViewController];
    [rootViewController presentViewController:callController animated:YES completion:^{
      [callController onCalling:lockName imageUrl:imageUrl];
    }];
  });
}

- (UIViewController *)getCurrentViewController
{
  return [[UIApplication sharedApplication] keyWindow].rootViewController;
}

//登录RTC账户
-(void)login:(NSString*)username
{
  self.accountName=username;
  [self onInit];
}

+(void)setApplicationUrl:(NSString*)url
{
  APP_WEB_SERVER_URL=[url copy];
}

+(NSString*)getApplicationUrl
{
  return APP_WEB_SERVER_URL;
}

+(RtcController *)getInstance
{
  if(!_INSTANCE)
  {
    _INSTANCE=[[RtcController alloc]init];
  }
  return _INSTANCE;
}

@end
