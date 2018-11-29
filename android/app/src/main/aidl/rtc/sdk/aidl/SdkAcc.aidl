package rtc.sdk.aidl;

import rtc.sdk.aidl.AccNotify;
import rtc.sdk.aidl.SdkCall;

interface SdkAcc {
	// 设置通知对象
	void setNotify(AccNotify acc); 
	// 扩充参数注册
	boolean registerFull(String cfg);
	// 释放用户对象
	void release();
	// 创建新呼叫
	SdkCall newCall(String cfg);
	// 断开所有呼叫
	void hangupAll();
	// 操作群组
	void optGroupCall(int action, String parameters);
	// 操作微直播	
//	void optMicroLive(int action, String parameters);
}
