//
//  RTCLive.h
//  RTCLive
//
//  Created by dongzhm on 16/3/17.
//  Copyright © 2016年 ding. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "sdkkey.h"
#import "sdkobj.h"
//错误码
#define EC_START_IDX -1000
#define ECIDXMAKE(IDX)  (EC_START_IDX-IDX)
#define EC_OK                   0
#define EC_MALLOC_MEM_FAILED	ECIDXMAKE(1)
#define EC_PARAM_WRONG			ECIDXMAKE(2)
#define EC_LOST_KEY				ECIDXMAKE(3)
#define EC_CANTT_RESET_PARAM	ECIDXMAKE(4)
#define EC_MAKE_CALL_FAILED     ECIDXMAKE(5)
#define EC_HAVENT_CALL          ECIDXMAKE(6)
#define EC_ACTION_FAILED        ECIDXMAKE(7)
#define EC_SDK_INITED           ECIDXMAKE(8)
#define EC_SDK_INIT_UNCOMPLETED ECIDXMAKE(9)
#define EC_SIZE_TOO_LARGE       ECIDXMAKE(10)
#define EC_UNSUPPORTED_FUNC     ECIDXMAKE(11)


/*
 * 支持的分辨率如下：
 * width*height     width*height   比例
 * 352x288(支持)          288x352(支持)           -- 11:9
 * 704x576(支持)          576x704(支持)           -- 11:9
 * 192x144(支持)          144x192(支持)           -- 12:9(4:3)
 * 480x360(支持)          360x480(支持)           -- 12:9(4:3)
 * 640x480(支持)          480x640(支持)           -- 12:9(4:3)
 * 1280x960(支持)         960x1280(支持)          -- 12:9(4:3)
 * 640x360(支持)          360x640(支持)           -- 16:9
 * 960x540(支持)          540x960(支持)           -- 16:9
 * 1280x720(支持)         720x1280(支持)          -- 16:9
 * 1920x1080(支持)        1080x1920(支持)         -- 16:9
 */

typedef struct RTCLivePara {
    int width;//视频宽度
    int height;//视频高度
    int videoFramerate;//视频帧率
    int cameraId;//摄像头选择：0 后置摄像头，1 前置摄像头
    int cameraOrientation;//AVCaptureVideoOrientation: AVCaptureVideoOrientationPortrait AVCaptureVideoOrientationLandscapeRight
    int videoCodec;//编码器选择：0 硬件编码，1 软件编码
    int onlyAudio;//仅音频直播：0 音视频，1 仅音频
    void* localVideoWindow;//视频预览窗口
} RTCLivePara;

@protocol RTCLiveCallBackProtocol <NSObject>
/**
 *   登陆RTC云平台结果回调
 *
 *  @param code   获取结果
 *  @param error  错误原因
 */
-(void)onNavigationResp:(int)code error:(NSString*)error;

/**
 *  直播连麦消息到达回调
 *
 *  @param param        上报参数
 *  可从中取出账户发送连麦请求的信息：
 *  NSString* uri = [param objectForKey:KEY_CALLER];
 *
 *  @return 错误码
 */
-(int)onReceiveJoinCastRequest:(NSDictionary*)param;

//连麦状态回调
-(int)onJoinCastStatus:(SDK_CALLBACK_TYPE)type code:(int)code;

/**
 *  设置连麦窗口回调，主播和连麦者都会收到此回调，用来设置各自所需窗口：
 *  连麦者：设置本地视频预览窗口（视频连麦需要设置，音频连麦不需要设置）
 *  主播：设置显示远端连麦者视频的窗口（视频连麦需要设置，音频连麦不需要设置）,可设置为NULL，则不显示连麦者画面
 *  @return 错误码
 */
-(int)onJoinCastNeedVideoWindow;

/**
 *  调用playMedia:(NSString *)mediaPath bounds:(CGRect)bounds函数之后的回调函数，设置当前视频的View
 *  @return 错误码
 */
-(int)onPlayMediaViewAvailable:(UIView*)view;

/**
 *  调用playMedia:(NSString *)mediaPath bounds:(CGRect)bounds函数之后的回调函数，设置当前视频的duration，单位秒
 *  @return 错误码
 */
-(int)onPlayMediaDurationAvailable:(NSTimeInterval)duration;

@end


#define RTCLivePlayerPlaybackDidFinishNotification @"PlaybackDidFinish" //当播放结束时,发送本通知
#define RTCLivePlayerPlaybackErrorNotification     @"PlaybackError"     //当播放器发生错误时,发送本通知 ￼
#define RTCLiveRtmpPushErrorNotification     @"RtmpPushError"     //当推流发生错误时（如推流断开，网络连接断开）,发送本通知 ￼

//RTCLivePlayerPlaybackErrorNotification返回的错误描述信息如下:
//@"Unable to open file"
//@"Unable to find stream information"
//@"Unable to find stream"
//@"Unable to find codec"
//@"Unable to open codec"
//@"Unable to allocate frame"
//@"Unable to setup scaler"
//@"Unable to setup resampler"
//@"The ability is not supported"



@interface RTCLive : NSObject
{
    id<RTCLiveCallBackProtocol> mDelegate;
}
@property(nonatomic,assign)id<RTCLiveCallBackProtocol> Delegate;
+(NSString*)ECodeToStr:(int)code;

/**
 *  @return SDK版本号
 */
+(NSString*)RTCLiveVersion;

/**
 *  对象初始化
 *
 *  @return  生成的RTCLive对象
 */
-(id)init;

/**
 *  登录RTC云平台
 *  @param appId      平台申请的appid
 *  @param appKey     平台申请的appkey
 *  @param usrId      平台申请的usrid
 *  @param usrKey     平台申请的usrkey
 *
 *  @return EC_OK，登录结果由回调函数返回
 */
-(int)loginRtcCloud:(NSString*)appId appKey:(NSString*)appKey usrId:(NSString*)usrId usrKey:(NSString*)usrKey;

/**
 *  登录RTC云平台
 *  @param appId      平台申请的appid
 *  @param usrId      平台申请的usrid
 *  @param capabilityToken      平台申请的token
 *
 *  @return EC_OK，登录结果由回调函数返回
 */
-(int)loginRtcCloud:(NSString*)appId usrId:(NSString*)usrId capabilityToken:(NSString*)capabilityToken;

/**
 *  获取推流和播放地址，登录成功之后调用
  *  @param appId      平台申请的inapplicationid
 */
-(int)getLiveChannel:(NSString*)accId andAccKey:(NSString*)accKey record:(NSString*)record;

/**
 *  播放直播：sdk只是构建播放的UIView，不含控制按钮和交互响应
 *  @param mediaPath   媒体地址
 *  @param bounds      播放的位置：坐标和宽高构成的CGRect
 *  返回 EC_OK或者错误码
 *  如果创建成功，通过回调函数onPlayMediaViewAvailable返回UIView，如果创建失败回调函数onPlayMediaViewAvailable返回NULL
 */
-(int)playMedia:(NSString *)mediaPath bounds:(CGRect)bounds;

/**
 *  暂停播放直播
 *  @return EC_OK或者错误码
 */
-(int)pausePlayMedia;

/**
 *  继续播放直播
 */
-(int)resumePlayMedia;

/**
 *  停止播放直播
 *  @return EC_OK或者错误码
 */
-(int)stopPlayMedia;

/**
 *  得到当前点播播放时间，单位秒
 *  @return position
 */
-(NSTimeInterval)getPlayMediaPosition;

/**
 *  设置当前点播时间，用于设置视频观看进度，单位秒
 *  @return EC_OK或者错误码
 */
-(int)setPlayMediaPosition:(NSTimeInterval)position;

/**
 *  开始直播预览
 *  必须先调用此接口开始直播预览，在预览窗口可以切换摄像头
 *  @param livePara
 *  @return EC_OK或者错误码
 */
-(int)startPreview:(RTCLivePara*)livePara;

/**
 *  开始直播
 *  必须先调用startPreview之后再调用此接口开始直播
 *  @param channelID          直播频道
 *  @param pushURL            直播推流地址
 *  @return EC_OK或者错误码
 */
-(int)startCast:(NSString *)channelID pushURL:(const char*)pushURL;

/**
 *  暂停直播
 *  @param bPause: 1 暂停直播 ，0 继续直播
 *  @param pauseJPG 暂停画面JPG格式文件地址，如果为空，则设置为SDK默认暂停画面
 *  @return EC_OK或者错误码
 */
-(int)pauseCast:(int)bPause pauseJPG:(NSString *)pauseJPG;

/**
 *  停止直播
 *  @return EC_OK或者错误码
 */
-(int)stopCast;

/**
 *  连麦者发送连麦请求
 *
 *  @param remoteUri   主播ID
 *
 *  @return 错误码
 */
-(int)sendJoinCastRequest:(NSString*)remoteUri remoteTerminalType:(NSString*)remoteTerminalType remoteAccType:(SDK_ACCTYPE)remoteAccType;

/**
 *  主播实施连麦
 *
 *  @param remoteUri   连麦者ID
 *  @param joinType 连麦类型：0 audio; 1 audio+video
 *  @return 错误码
 */
-(int)doJoinCast:(NSString*)remoteUri joinType:(int)joinType remoteTerminalType:(NSString*)remoteTerminalType remoteAccType:(SDK_ACCTYPE)remoteAccType;

/**
 *  停止连麦（主播或连麦者都可调用）
 *  @return 错误码
 */
-(int)doStopJoinCast;

/**
 *  创建一个主播显示远端连麦者视频的窗口，该窗口基于UIView类，但是有所扩展，
 *  对于主播显示远端连麦者视频的窗口必须用此接口创建才能用于doSetJoinCastVideoWindow调用
 *  @return UIView扩展类窗口IOSDisplay
 */
+(IOSDisplay*)newJoinCastVideoWindow:(CGRect)frame;

/**
 *  设置连麦者本地视频预览窗口
 *  或者
 *  设置主播显示远端连麦者视频的窗口,可设置为NULL，则不显示连麦者画面
 *
 *  @param videoWindow    连麦者本地视频预览窗口或者主播显示远端连麦者视频窗口
 *
 *  @return 错误码
 */
-(int)doSetJoinCastVideoWindow:(void*)videoWindow;

/**
 *  切换摄像头
 *  @return EC_OK或者错误码
 */
-(int)switchCamera;

/**
 *  旋转摄像头
 *  @return EC_OK或者错误码
 *  @param angle: 0, 90, 180, 270
 *  @return EC_OK或者错误码
 */
-(int)rotateCamera:(int)angle;

/**
 *  关闭麦克/开启麦克
 *  @param bMute: 1 关闭麦克 ，0 开启麦克
 *  @return EC_OK或者错误码
 */
-(int)muteMic:(int)bMute;

/**
 *  @return 得到直播已发送字节，单位KB
 */
-(long)getKBSent;

/**
 *  @return 得到直播缓存中字节，单位KB
 */
-(long)getKBQueue;

/**
 *  @return 得到直播上传速率，单位KB/S
 */
-(long)getKBitrate;

/**
 *  @return 得到直播时间，单位S
 */
-(long)getTimeCast;

/**
 *  @return 直播状态
 */
-(long)isConnected;

/**
 *  对象释放
 */
-(void)dealloc;

@end


//#define iPhone5 ([UIScreen instancesRespondToSelector:@selector(currentMode)] ? CGSizeEqualToSize(CGSizeMake(640, 1136), [[UIScreen mainScreen] currentMode].size) : NO)
#define SCREEN_WIDTH       [[UIScreen mainScreen] bounds].size.width
#define SCREEN_HEIGHT      [[UIScreen mainScreen] bounds].size.height
#define SCREEN_SCALE        [UIScreen mainScreen].scale
//系统是否为ios5以上
#define ISIOS5 !([[[UIDevice currentDevice] systemVersion] floatValue] <=4.9f)
//系统是否为ios6以上
#define ISIOS6 !([[[UIDevice currentDevice] systemVersion] floatValue] <=5.9f)
//系统是否为ios7以上
#define ISIOS7 !([[[UIDevice currentDevice] systemVersion] floatValue] <=6.9f)
//状态栏高度
#define  CW_STATUSBAR_HEIGHT  20.0f
#define  IOS7_STATUSBAR_DELTA   (ISIOS7?(CW_STATUSBAR_HEIGHT):0)
