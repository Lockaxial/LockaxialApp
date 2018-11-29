#import "sdkkey.h"
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

/* 通知栏消息
*  @param title   标题
*  @param body  通知内容
*  @param sound     通知铃声，默认铃声为UILocalNotificationDefaultSoundName，自定义铃声可传入音频文件路径
*  @param iscall      缺省参数，传入YES即可
 */
void makeNotification(NSString* title,NSString* body,NSString* sound,BOOL iscall);

//配置文件的名称（配置文件要放在程序沙盒的document目录下）
#define CONFIGURE_INFO_FILE_NAME     @"configure"
typedef enum
{
    CinLogLevelDebug = 0,
    CinLogLevelInfo,
    CinLogLevelWarning,
    CinLogLevelError
}CinLogLevel;

void writeCinLog( const char* function,        // 记录日志所在的函数名称
                 CinLogLevel level,            // 日志级别，Debug、Info、Warn、Error
                 NSString* format,            // 日志内容，格式化字符串
                 ... );                        // 格式化字符串的参数
void vWriteCinLog( const char* function,
                  CinLogLevel level,
                  NSString* format,
                  va_list args);

void cWriteCinLog( const char* function,
                  CinLogLevel level,
                  const char* format,
                  ... );
void cvWriteCinLog( const char* function,
                   CinLogLevel level,
                   const char* format,
                   va_list args);

#ifndef OPEN_CWDEBUG_LOG
#define OPEN_CWDEBUG_LOG
#endif

#ifdef  OPEN_CWDEBUG_LOG
#define CWLogDebug(format,...)       writeCinLog(__FUNCTION__,CinLogLevelDebug,format,##__VA_ARGS__)
#define CWLogInfo(format,...)        writeCinLog(__FUNCTION__,CinLogLevelInfo,format,##__VA_ARGS__)
#define CWLogWarn(format,...)        writeCinLog(__FUNCTION__,CinLogLevelWarning,format,##__VA_ARGS__)
#define CWLogError(format,...)       writeCinLog(__FUNCTION__,CinLogLevelError,format,##__VA_ARGS__)
#define CWLogVCStr(level,tag,format,args) cvWriteCinLog(tag,level,format,args)
#define CWLogVNSStr(level,tag,format,args) vWriteCinLog(tag,level,format,args)
#else
#define CWLogDebug(format,...)      NSLog(format, ##__VA_ARGS__)
#define CWLogInfo(format,...)       NSLog(format, ##__VA_ARGS__)
#define CWLogWarn(format,...)       NSLog(format, ##__VA_ARGS__)
#define CWLogError(format,...)      NSLog(format, ##__VA_ARGS__)
#define CWLogVCStr(level,tag,format,args) NSLogv(format,args)
#define CWLogVNSStr(level,tag,format,args) NSLogv(format,args)
#endif

//初始化日志打印系统，打印log必须调用
void initCWDebugLog();

//视频远端
@interface IOSDisplay : UIView {
}
@end

IOSDisplay* initIOSDisplay(CGRect frame);

//设备信息
@interface OpenUDIDRTC : NSObject {
}
+ (NSString*) value;
+ (NSString*) valueWithError:(NSError**)error;
+ (void) setOptOut:(BOOL)optOutValue;
@end

typedef enum {
    UIDeviceFamilyiPhone,
    UIDeviceFamilyiPod,
    UIDeviceFamilyiPad,
    UIDeviceFamilyAppleTV,
    UIDeviceFamilyUnknown,
    
} UIDeviceFamily;

@interface UIDevice (Hardware)//分类
- (NSString *) platform;
- (NSString *) hwmodel;
- (NSUInteger) platformType;
- (NSString *) platformString;
- (NSUInteger) cpuFrequency;
- (NSUInteger) busFrequency;
- (NSUInteger) cpuCount;
- (NSUInteger) totalMemory;
- (NSUInteger) userMemory;
- (NSNumber *) totalDiskSpace;
- (NSNumber *) freeDiskSpace;
- (NSString *) macaddress;
- (BOOL) hasRetinaDisplay;
- (UIDeviceFamily) deviceFamily;
- (float)cpuUseage;
- (double) availableMemory;
- (double) usedMemory;
@end

@protocol SdkObjCallBackProtocol <NSObject>
/**
 *  导航结果回调
 *
 *  @param code   导航数据获取结果
 *  @param error  错误原因
 */
-(void)onNavigationResp:(int)code error:(NSString*)error;
@end

@interface SdkObj:NSObject
@property(nonatomic,assign)id<SdkObjCallBackProtocol> Delegate;
//错误码转字符串
+(NSString*)ECodeToStr:(int)code;
/**
 *  对象初始化
 *
 *  @return  生成的sdkobj对象
 */
-(id)init;
/**
 *  对象释放
 */
-(void)dealloc;
/**
 *  设置SDK基础信息
 *
 *  @param agentStr   应用标识
 *  @param terminal   终端类型
 *  @param udid       终端标识
 *  @param appId      平台申请的appid
 *  @param appKey     平台申请的appkey
 *
 *  @return 错误码
 */
-(int)setSdkAgent:(NSString*)agentStr terminalType:(NSString*)terminal UDID:(NSString*)udid appID:(NSString*)appId appKey:(NSString*)appKey;
/**
 *  获取服务器信息
 *
 *  @param url   导航服务器地址
 *
 *  @return 错误码
 */
-(int)doNavigation:(NSString*)url;
/**
 *  返回初始化状态
 *
 *  @return  初始化状态
 */
-(BOOL)isInitOk;
/**
 *  设置音频编解码
 *
 *  @param param   编码参数
 *
 *  @return 错误码
 */
-(int)setAudioCodec:(NSNumber*)param;
/**
 *  设置视频编解码
 *
 *  @param param   编码参数
 *
 *  @return 错误码
 */
#if (SDK_HAS_VIDEO>0)
-(int)setVideoCodec:(NSNumber*)param;
#endif
/**
 *  设置视频分辨率
 *
 *  @param param   分辨率参数
 *
 *  @return 错误码
 */
#if (SDK_HAS_VIDEO>0)
-(int)setVideoAttr:(NSNumber*)param;
#endif
/**
 *  应用切换到后台
 */
-(void)onAppEnterBackground;
/**
 *  网络切换
 */
-(void)onNetworkChanged;
@end

@class CallObj;
@class AccObj;

@protocol AccObjCallBackProtocol <NSObject>
/**
 *  IM消息发送回调
 *
 *  @param param        上报参数
 *
 *  @return 错误码
 */
-(int)onSendIM:(int)status;
/**
 *  IM消息到达回调
 *
 *  @param param        上报参数
 *  @param accObj       账户对象
 *
 *  @return 错误码
 */
-(int)onReceiveIM:(NSDictionary*)param withAccObj:(AccObj*)accObj;
/**
 *  呼叫到达回调
 *
 *  @param param        上报参数
 *  @param newCallObj   呼叫对象
 *  @param accObj       账户对象
 *
 *  @return 错误码
 */
-(int)onCallIncoming:(NSDictionary*)param withNewCallObj:(CallObj*)newCallObj accObj:(AccObj*)accObj;
/**
 *  注册结果回调
 *
 *  @param result       上报参数
 *  @param accObj       账户对象
 *
 *  @return 错误码
 */
-(int)onRegisterResponse:(NSDictionary*)result  accObj:(AccObj*)accObj;
/**
 *  设置APNs结果回调
 *
 *  @param result       上报参数
 *  @param accObj       账户对象
 *
 *  @return 错误码
 */
-(int)onSetAPNsResponse:(NSDictionary*)result  accObj:(AccObj*)accObj;
/**
 *  用户在线状态查询结果回调
 *
 *  @param result       上报参数
 *  @param accObj       账户对象
 *
 *  @return 错误码
 */
-(int)onAccStatusQueryResponse:(NSDictionary*)result accObj:(AccObj*)accObj;
/**
 *  通知消息回调
 *
 *  @param param        上报参数
 *  @param accObj       账户对象
 *
 *  @return 错误码
 */
-(int)onNotifyMessage:(NSDictionary*)param accObj:(AccObj*)accObj;
#if (SDK_HAS_GROUP>0)
/**
 *  多人呼叫到达回调
 *
 *  @param param        上报参数
 *  @param newCallObj   呼叫对象
 *  @param accObj       账户对象
 *
 *  @return 错误码
 */
-(int)onGroupCreate:(NSDictionary*)param withNewCallObj:(CallObj*)newCallObj accObj:(AccObj*)accObj;
#endif
@end

@interface AccObj:NSObject
@property(nonatomic,assign)id<AccObjCallBackProtocol> Delegate;
@property(nonatomic,assign)BOOL isBackground;
/**
 *  对象初始化
 *
 *  @return  生成的accobj对象
 */
-(id)init;
/**
 *  对象释放
 */
-(void)dealloc;
/**
 *  账户对象绑定sdk对象
 *
 *  @param sdkObj   sdk对象
 *
 *  @return 错误码
 */
-(int)bindSdkObj:(SdkObj*)sdkObj;
/**
 *  获取token
 *
 *  @param accId      账户ID
 *  @param accType    帐号体系
 *  @param grant      能力权限
 *  @param authType   授权方式
 *
 *  @return 错误码
 */
-(int)getToken:(NSString*)accId andType:(SDK_ACCTYPE)accType andGrant:(NSString*)grant andAuthType:(SDK_ACC_AUTH_TYPE)authType;
/**
 *  设置APNs
 *
 *  @param accId      账户ID
 *  @param pushToken   推送token
 *  @param pushId    申请得到的pushId
 *  @param pushKey      申请得到的pushKey
 *  @param pushMaster   申请得到的pushMaster
 *
 *  @return 错误码
 */
-(int)setAPNsToken:(NSString*)accId andPushToken:(NSString*)pushToken andPushId:(NSString*)pushId andPushKey:(NSString*)pushKey andPushMaster:(NSString*)pushMaster;
/**
 *  用户注册
 *
 *  @param infoDic   上报参数
 *
 *  @return 错误码
 */
-(int)doAccRegister:(NSDictionary*)infoDic;
/**
 *  用户注册结果查询
 *
 *  @return 查询结果
 */
-(BOOL)isRegisted;
/**
 *  用户注册状态刷新
 *
 *  @return 刷新结果
 */
-(int)doRegisterRefresh;
/**
 *  用户在线状态查询
 *
 *  @param accIds     查询id
 *  @param flag       查询类型
 *
 *  @return 错误码
 */
-(int)doAccStatusQuery:(NSString*)accIds andSearchFlag:(SDK_ACC_SEARCH_FLAG)flag;
/**
 *  读取用户在线id
 *
 *  @param dic        上报参数
 *  @param online     在线状态
 *  @param index      索引
 *
 *  @return 错误码
 */
-(NSString*)getUserStatus:(NSDictionary*)dic  online:(int*)online atIndex:(int)index;
/**
 *  用户注销登录
 *
 *  @return 结果
 */
-(int)doUnRegister;
/**
 *  发送IM消息
 *
 *  @param param   消息参数
 *
 *  @return 错误码
 */
-(int)doSendIM:(NSDictionary*)param;
#if (SDK_HAS_GROUP>0)
/**
 *  读取会议列表
 *
 *  @return 错误码
 */
-(int)getGroupList;
/**
 *  会议录制状态查询
 *
 *  @param param   参数
 *
 *  @return 错误码
 */
-(int)getGroupRecordStatus:(NSDictionary*)param;
/**
 *  会议录制文件管理
 *
 *  @param param   参数
 *
 *  @return 错误码
 */
-(int)doManageGroupRecord:(NSDictionary*)param;
#endif
/**
 *  上传本地文件
 *
 *  @param param   参数
 *
 *  @return 错误码
 
 *  此接口目前只支持http，需要在plist文件中配置域名ctbri.up0.v1.wcsapi.com为可信任
 */
-(int)doUploadFile:(NSDictionary*)param;
/**
 *  取消本地文件上传
 *
 *  @param param   上传文件路径
 *
 *  @return 错误码
 */
-(int)doCancelUploadFile:(NSString*)path;
/**
 *  本地文件上传状态查询
 *
 *  @param param   参数
 *
 *  @return 错误码
 */
-(int)getUploadFileStatus:(NSDictionary*)param;
/**
 *  本地文件上传管理
 *
 *  @param param   参数
 *
 *  @return 错误码
 */
-(int)doManageUploadFile:(NSDictionary*)param;

-(int)getLiveChannel:(NSString*)accId andAccKey:(NSString*)accKey record:(NSString*)record;
@end


@protocol CallObjCallBackProtocol <NSObject>
/**
 *  呼叫事件回调
 *
 *  @param type      呼叫回调类型
 *  @param code      上报信息
 *  @param callObj   呼叫对象
 *
 *  @return 错误码
 */
-(int)onCallBack:(SDK_CALLBACK_TYPE)type code:(int)code callObj:(CallObj*)callObj;
/**
 *  媒体建立事件回调
 *
 *  @param mediaType  媒体类型
 *  @param callObj    呼叫对象
 *
 *  @return 错误码
 */
-(int)onCallMediaCreated:(int)mediaType callObj:(CallObj*)callObj;
/**
 *  点对点录音录像回调
 *
 *  @param result  录制状态
 *  @param callObj    呼叫对象
 *
 *  @return 错误码
 */
-(int)onRecordStatus:(NSDictionary*)result callObj:(CallObj*)callObj;
/**
 *  网络状态回调
 *
 *  @param desc      上报信息
 *  @param callObj   呼叫对象
 *
 *  @return 错误码
 */
-(int)onNetworkStatus:(NSString*)desc callObj:(CallObj*)callObj;
#if (SDK_HAS_GROUP>0)
/**
 *  多人请求消息回调
 *
 *  @param result   上报信息
 *  @param grpObj   呼叫对象
 *
 *  @return 错误码
 */
-(int)onGroupResponse:(NSDictionary*)result grpObj:(CallObj*)grpObj;
#endif
@end

@interface CallObj:NSObject
@property(nonatomic,assign)id<CallObjCallBackProtocol> Delegate;
@property(nonatomic,assign)BOOL MuteStatus;//静音状态
@property(nonatomic,assign)int  CallMedia;//媒体类型
@property(nonatomic,assign,readonly,getter = getCallDuration)unsigned int  CallDuration;//获取呼叫时长
/**
 *  对象初始化
 *
 *  @return  生成的callobj对象
 */
-(id)init;
/**
 *  对象释放
 */
-(void)dealloc;
/**
 *  呼叫对象绑定账户对象
 *
 *  @param accObj   accObj对象
 *
 *  @return 错误码
 */
-(int)bindAcc:(AccObj*)accObj;
/**
 *  发起呼叫
 *
 *  @param param   呼叫参数
 *
 *  @return 错误码
 */
-(int)doMakeCall:(NSDictionary*)param;
/**
 *  接听呼叫
 *
 *  @param CallType   接听呼叫类型
 *
 *  @return 错误码
 */
-(int)doAcceptCall:(NSNumber*)CallType;
/**
 *  拒接来电
 *
 *  @return 错误码
 */
-(int)doRejectCall;
/**
 *  挂机
 *
 *  @return 错误码
 */
-(int)doHangupCall;
/**
 *  释放呼叫资源，callobj释放时调用
 *
 *  @return 错误码
 */
-(int)doReleaseCallResource;
/**
 *  静音
 *
 *  @param action   静音开关
 *
 *  @return 错误码
 */
-(int)doMuteMic:(SDK_MUTE)action;
/**
 *  获取音频播放设备
 *
 *  @return 音频播放设备
 */
-(SDK_AUDIO_OUTPUT_DEVICE)getAudioOutputDeviceType;
/**
 *  切换音频播放设备
 *
 *  @param newAudioDevice   音频播放设备类型
 *
 *  @return 错误码
 */
-(int)doSwitchAudioDevice:(SDK_AUDIO_OUTPUT_DEVICE)newAudioDevice;
/**
 *  发送dtmf
 *
 *  @param dtmf   dtmf按键
 *
 *  @return 错误码
 */
-(int)doSendDtmf:(int)dtmf;
#if (SDK_HAS_VIDEO>0)
/**
 *  设置视频呼叫远端
 *
 *  @param remoteVideoWindow   远端视频窗口
 *  @param localVideoWindow    本地视频窗口
 *
 *  @return 错误码
 */
-(int)doSetCallVideoWindow:(IOSDisplay*)remoteVideoWindow localVideoWindow:(void*)localVideoWindow;
/**
 *  开始视频录制
 *
 *  @return 错误码
 */
-(int)doStartRecording;
/**
 *  停止视频录制，视频保存在本地相册
 *
 *  @return 错误码
 */
-(int)doStopRecording;
/**
 *  摄像头切换，美颜
 *
 *  @param cameraIndex   摄像头类型，1为前置，0为后置
 *
 *  @return 错误码
 */
-(int)doSwitchCamera:(int)cameraIndex;
/**
 *  摄像头切换，美颜
 *
 *  @param balance   白平衡，取值范围0-255
 *
 *  @param deNoise   磨皮，取值范围0-10
 *
 *  @param colorEnhance   滤镜，取值范围0-12，1 暖黄 2 冷蓝 3 冷绿 4 冷紫 5 粉红 6 青色 7 暖化 8 底片 9 黑白 10 怀旧 11 淡化 12 色调对换
 *
 *  @return 错误码
 */
-(int)doSetBalance:(int)balance andDeNoise:(int)deNoise andColorEnhance:(int)colorEnhance;
/**
 *  重新加载摄像头
 *
 *  @return 错误码
 */
-(int)doChangeView;
/**
 *  隐藏本地视频
 *
 *  @param action   隐藏开关
 *
 *  @return 错误码
 */
-(int)doHideLocalVideo:(SDK_HIDE_LOCAL_VIDEO)action;
/**
 *  旋转远端视频
 *
 *  @param angel   旋转角度
 *
 *  @return 错误码
 */
-(int)doRotateRemoteVideo:(SDK_VIDEO_ROTATE)angel;
/**
 *  截取远端视频
 *
 *  @return 错误码
 */
-(int)doSnapImage;
#endif
#if (SDK_HAS_GROUP>0)
/**
 *  多人会话请求
 *
 *  @param action   多人会话请求类型
 *  @param param    会话参数
 *
 *  @return 错误码
 */
-(int)groupCall:(int)action param:(NSDictionary*)param;
#endif
@end


