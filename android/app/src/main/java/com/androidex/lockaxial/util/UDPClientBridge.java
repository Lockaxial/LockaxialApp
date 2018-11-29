package com.androidex.lockaxial.util;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Created by Administrator on 2017/2/18.
 */

public class UDPClientBridge extends ReactContextBaseJavaModule {

    public UDPClientBridge(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    public String getName() {
        return "UDPClient";
    }

    @ReactMethod
    public void write(String data,Callback callback){
        String result = UDPHandler.getInstance().write(data);
        String err = "";
        if("-1".equals(result)){
            err = "设备连接超时";
            result = "";
        }else if("-2".equals(result)){
            err = "设备连接异常";
            result = "";
        }else if("-3".equals(result)){
            err = "未知异常";
            result = "";
        }
        callback.invoke(err,result);
    }
}
