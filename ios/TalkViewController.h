//
//  TalkViewController.h
//  Intermobile
//
//  Created by 结点科技 on 2017/2/16.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface TalkViewController : UIViewController

/* 挂断 */
-(IBAction) hangUp:(id)sender;

/* 语音对讲 */
-(IBAction) startSpeech:(id)sender;

/* 视频对讲 */
-(IBAction) startVedio:(id)sender;

/* 开门 */
-(IBAction) openDoor:(id)sender;

@end
