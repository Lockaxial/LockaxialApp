package rtc.sdk.aidl;

import rtc.sdk.aidl.CallNotify;

interface SdkCall {
	// 设置通知对象
	void setNotify(CallNotify call); 
	// 接听 
	int accept(int callType);
	// 挂断
	void hangup();
	// 释放对象
	void release();
	// 获取呼叫信息json kCallxxx
	String getInfo();
	// 发送按键
	void sendDTMF(int nChar);
	// 静音mic
	void muteMic(int bMute);
}
