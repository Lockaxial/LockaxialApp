//
//  UDPHandler.m
//  Intermobile
//
//  Created by 结点科技 on 2017/3/4.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "UDPHandler.h"
#import "GCDAsyncUdpSocket.h"

@interface UDPHandler()
{
  long tag;
  
  RCTResponseSenderBlock callback;
}

@end

@implementation UDPHandler

// 因为实例是全局的 因此要定义为全局变量，且需要存储在静态区，不释放。不能存储在栈区。
UDPHandler *handler = nil;
GCDAsyncUdpSocket *udpSocket = nil;
NSString *address = @"192.168.0.199";
uint16_t  port = 9000;
bool isResponed = YES;
NSTimer *timer = nil;

// 伪单例 和 完整的单例。 以及线程的安全。
// 一般使用伪单例就足够了 每次都用 sharedDataHandle 创建对象。
+ (UDPHandler *) shareInstance
{
  // 添加同步锁，一次只能一个线程访问。如果有多个线程访问，等待。一个访问结束后下一个。
  @synchronized(self){
    if (nil == handler) {
      handler = [[UDPHandler alloc] init];
      // 初始化udp
      udpSocket = [[GCDAsyncUdpSocket alloc] initWithDelegate:handler delegateQueue:dispatch_get_main_queue()];
      [handler setupSocket];
    }
  }
  return handler;
}

/**
 * 开始接收数据
 */
- (void) setupSocket
{
  NSError *error = nil;
  
  if(![udpSocket bindToPort:0 error:&error]){
    NSLog(@"连接失败：%@",error);
    return;
  }
  
  // 开始接收数据
  if(![udpSocket beginReceiving:&error]){
    NSLog(@"beginReceiving：%@",error);
    return;
  }
}

/**
 *  写数据
 */
- (uint8_t) write:(NSString *) msg cb:(RCTResponseSenderBlock) cb
{
  if(isResponed == NO){
    cb(@[@"操作频繁,请稍后！",[NSNull null]]);
    return 1;
  }
  handler->callback = cb;
  isResponed = NO;
  NSData *data = [msg dataUsingEncoding:NSUTF8StringEncoding];
  // timer = [NSTimer scheduledTimerWithTimeInterval:2 target:self selector:@selector(cancelRequest) userInfo:nil repeats:NO];
  [udpSocket sendData:data toHost:address port:port withTimeout:1000 tag:tag];
  tag++;
  
  //创建Timer
  timer = [NSTimer timerWithTimeInterval:5.0 target:self selector:@selector(cancelRequest) userInfo:nil repeats:NO];
  //使用NSRunLoopCommonModes模式，把timer加入到当前Run Loop中。
  [[NSRunLoop mainRunLoop] addTimer:timer forMode:NSRunLoopCommonModes];
  
  return 0;
}

- (void) cancelRequest
{
  if(isResponed == NO){
    [self response:nil err:@"电梯请求超时"];
  }
}


/**
 *  接收服务器返回数据
 */
- (void)udpSocket:(GCDAsyncUdpSocket *)sock didReceiveData:(NSData *)data fromAddress:(NSData *)address withFilterContext:(id)filterContext
{
  NSString *msg = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
  if (msg)
  {
    NSLog(@"RECV: %@", msg);
  }
  else
  {
    NSString *host = nil;
    uint16_t port = 0;
    [GCDAsyncUdpSocket getHost:&host port:&port fromAddress:address];
    NSLog(@"RECV: Unknown message from: %@:%hu", host, port);
  }
  
  [self response:msg err:nil];
}

/**
 *  发送失败
 */
- (void)udpSocket:(GCDAsyncUdpSocket *)sock didNotSendDataWithTag:(long)tag dueToError:(NSError *)error
{
  NSLog(@"消息发送失败: %@",@"发送超时");
  [self response:nil err:[error localizedDescription]];
}


/**
 *  响应回调函数
 */
- (void) response:(NSString *) data err:(NSString *) error{
  if(timer != nil){
    [timer invalidate];
    timer = nil;
  }
  isResponed = YES;
  if(callback != nil){
    if (error == nil){
      callback(@[[NSNull null],data]);
    }else{
      callback(@[error,[NSNull null]]);
    }
    callback = nil;
  }
  
}

@end
