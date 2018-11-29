#import "TalkController.h"

#import <AudioToolbox/AudioToolbox.h>
#import <AVFoundation/AVFoundation.h>
#import <SystemConfiguration/CaptiveNetwork.h>
#import <AVFoundation/AVCaptureSession.h>
#import <CoreMotion/CoreMotion.h>
#import "RtcController.h"

@interface TalkController ()
{
  BOOL speakerState;//NO 听筒;YES 扬声
  CGRect screenRect;
  int marginHeight;
  int marginWidth;
  int imageSize;
  int labelHeight;
  int buttonSize;
  int toolBarY;
}
@property (nonatomic,strong) IBOutlet UILabel* fromNameLabel;
@property (nonatomic,strong) UIButton* speakerSwitchButton;
@property (nonatomic,strong) UIButton* closeRtcButton;
@end

@implementation TalkController
@synthesize remoteVideoView = _remoteVideoView;
@synthesize localVideoView = _localVideoView;
@synthesize speakerSwitchButton,closeRtcButton;


#pragma mark - Func
//--------------------界面部分---------------
- (void)loadView
{
  UIView *view=[[UIView alloc]initWithFrame:[[UIScreen mainScreen]applicationFrame]];
  self.view=view;
  view.backgroundColor=[UIColor blackColor];
  [self initScreen];
}

//界面初始化
-(void)initScreen
{
  screenRect=self.view.bounds;
  marginHeight=screenRect.size.height/10;
  marginWidth=screenRect.size.width/10;
  imageSize=screenRect.size.width*4/5;
  labelHeight=30;
  buttonSize=80;
  toolBarY=screenRect.size.height-marginHeight-buttonSize;
  [self initVideoView];
  [self initToolbar];
  [self initLockLabel];
}

//初始化可视对讲图像View
-(void)initVideoView
{
  int videoWidth=130;
  int videoHeight=170;
  int videoViewWidth=0;
  int videoViewHeight=0;
  if(screenRect.size.width/(toolBarY-marginHeight)>videoWidth/videoHeight)
  {
    videoViewHeight=(toolBarY-marginHeight);
    videoViewWidth=(toolBarY-marginHeight)*videoWidth/videoHeight;
  }
  else
  {
    videoViewWidth=imageSize;
    videoViewHeight=imageSize*videoHeight/videoWidth;
  }
  int lx=(screenRect.size.width-videoViewWidth)/2;
  int ly=((toolBarY-marginHeight-videoViewHeight)/2+marginHeight);
  self.remoteVideoView = [[IOSDisplay alloc]initWithFrame:CGRectMake(lx,ly,videoViewWidth, videoViewHeight)];
  self.localVideoView = [[UIView alloc]initWithFrame:CGRectMake(lx,ly,videoViewWidth/4, videoViewHeight/4)];
  
  [self.view addSubview:self.remoteVideoView];
  [self.view addSubview:self.localVideoView];
}


//初始化工具条
-(void)initToolbar
{
  int buttonNumber=2;
  int buttonMargin=(screenRect.size.width-buttonNumber*buttonSize)/(buttonNumber+1);
  CGRect speakerSwitchButtonFrame=CGRectMake((buttonMargin*1+buttonSize*0), toolBarY, buttonSize, buttonSize);
  [self.speakerSwitchButton=[UIButton alloc]initWithFrame:speakerSwitchButtonFrame];
  [self.speakerSwitchButton setTitle:@"切换免提" forState:UIControlStateNormal];
  [self.speakerSwitchButton setBackgroundColor:[UIColor blackColor]];
  [self.speakerSwitchButton addTarget:self action:@selector(onSwitchSpeaker:) forControlEvents:UIControlEventTouchUpInside];
  [self.view addSubview:self.speakerSwitchButton];
  
  CGRect closeRtcButtonFrame=CGRectMake((buttonMargin*2+buttonSize*1), toolBarY, buttonSize, buttonSize);
  [self.closeRtcButton=[UIButton alloc]initWithFrame:closeRtcButtonFrame];
  [self.closeRtcButton setTitle:@"挂断" forState:UIControlStateNormal];
  [self.closeRtcButton setBackgroundColor:[UIColor blackColor]];
  [self.closeRtcButton addTarget:self action:@selector(onHangUp:) forControlEvents:UIControlEventTouchUpInside];
  [self.view addSubview:self.closeRtcButton];
}

-(void)initLockLabel
{
  CGRect labelFrame=CGRectMake(0, (marginHeight*2+imageSize/2), screenRect.size.width,labelHeight);
  self.fromNameLabel=[[UILabel alloc]initWithFrame:labelFrame];
  self.fromNameLabel.textAlignment =NSTextAlignmentCenter;
  [self.fromNameLabel setTextColor:[UIColor whiteColor]];
  self.fromNameLabel.text=@"正在拨打中...";
  [self.view addSubview:self.fromNameLabel];
}

-(void)onCalling:(BOOL)isVideo
{
  if(isVideo){
    [self.fromNameLabel setHidden:YES];
  }else{
    self.fromNameLabel.text=@"正在通话中...";
  }
}

-(void)setCallInfoHidden:(BOOL)isHidden
{
  [self.fromNameLabel setHidden:isHidden];
}

- (void)viewDidDisappear:(BOOL)animated
{
  
}

-(void)viewDidAppear:(BOOL)animated
{
}

//--------------定时检查------------

-(void)onTimeoutChecking:(NSTimer*)timer
{
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:@"", @"params",
                          [NSNumber numberWithInt:MSG_CALL_TIMEOUT],@"msgid",
                          [NSNumber numberWithInt:0],@"arg",
                          nil];
  [[NSNotificationCenter defaultCenter]  postNotificationName:@"RTC_NOTIFY_EVENT" object:nil userInfo:params];
}


//--------------响应事件------------

//发送事件消息
-(void)sendRtcNotifyEvent:(eventid)eventId
{
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:@"", @"params",
                          [NSNumber numberWithInt:eventId],@"msgid",
                          nil,@"arg",
                          nil];
  [[NSNotificationCenter defaultCenter]  postNotificationName:@"RTC_NOTIFY_EVENT" object:nil userInfo:params];
}

//挂断
-(IBAction)onHangUp:(id)sender
{
  [self sendRtcNotifyEvent:MSG_HANGUP];
}

//转换听筒模式
-(IBAction)onSwitchSpeaker:(id)sender
{
  [self sendRtcNotifyEvent:MSG_SET_AUDIO_DEVICE];
}

-(void)setLog:(NSString*)log
{
  NSDateFormatter *dateFormat=[[NSDateFormatter alloc] init];
  [dateFormat setDateFormat:@"HH:mm:ss"];
  NSString* datestr = [dateFormat stringFromDate:[NSDate date]];
  CWLogDebug(@"SDKTEST:%@:%@",datestr,log);
}

@end
