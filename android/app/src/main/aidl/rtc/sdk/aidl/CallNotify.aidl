package rtc.sdk.aidl;

// 对呼叫需要实现的接口
interface CallNotify {
	// 对方振铃 
	void onRing();
	// 对方接听
	void onAccept();
	// 对方挂断/取消/拒接
	void onClose();
	// 呼叫失败
	void onFail(int nStatus);
}
