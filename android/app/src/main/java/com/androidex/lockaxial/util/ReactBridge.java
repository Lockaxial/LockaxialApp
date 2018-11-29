package com.androidex.lockaxial.util;

import android.content.ComponentName;
import android.content.Intent;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.support.annotation.Nullable;
import android.util.Log;

import com.androidex.lockaxial.InfoManagerActivity;
import com.androidex.lockaxial.service.MainService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

import cn.smssdk.EventHandler;
import cn.smssdk.SMSSDK;

/**
 * Created by asus on 2016/12/28.
 */

public class ReactBridge extends ReactContextBaseJavaModule {
    public static Messenger serviceMessenger=null;
    private static ReactApplicationContext currentReactContext=null;

    public ReactBridge(ReactApplicationContext reactContext) {
        super(reactContext);
        currentReactContext=reactContext;
    }

    /**
     * 返回模块的名称，该名称在React端调用需要用到
     * @return
     */
    @Override
    public String getName(){
        return "ReactBridge";
    }

    /**
     * 注册模块的常量
     * @return
     */
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        return constants;
    }

    /**
     * 发送消息到MainService，用于处理耗时的任务，一般针对可视对讲和门禁的操作都在MainService中
     * @param code
     * @param parameter
     */
    @ReactMethod
    public void sendMainMessage(int code,String parameter) {
        Log.v("ReactBridge","------>try to send Main Service<-------"+code+"="+parameter);

        if(serviceMessenger==null){
            if(code==10001){
                MainService.RTC_ACCOUNT_NAME=parameter;
            }
            Log.v("ReactBridge","------>only set the account name<-------"+code+"="+parameter);
        }else{
            //MainApplication app=(MainApplication)activity.getApplication();
            Log.v("ReactBridge","------>send message to service messageer<-------"+code+"="+parameter);
            Message message = Message.obtain();
            message.what = code;
            message.obj = parameter;
            try {
                serviceMessenger.send(message);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
            WritableMap params = Arguments.createMap();
            sendReactMessage("sendOK",params);
        }
    }

    public static void sendReactMessage(
                           String eventName,
                           @Nullable WritableMap params) {
        if(currentReactContext!=null){
            currentReactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
        }
    }

    public static EventHandler eventHandler=new EventHandler(){
        @Override
        public void afterEvent(int event, int result, Object data) {
            if (result == SMSSDK.RESULT_COMPLETE) {
                //回调完成
                if (event == SMSSDK.EVENT_SUBMIT_VERIFICATION_CODE) {
                    sendReactMessage("verifySmsSuccess",null);
                }else if (event == SMSSDK.EVENT_GET_VERIFICATION_CODE){
                    sendReactMessage("sendSmsSuccess",null);
                }else if (event ==SMSSDK.EVENT_GET_SUPPORTED_COUNTRIES){
                    //返回支持发送验证码的国家列表
                }
            }else{
                if (event == SMSSDK.EVENT_SUBMIT_VERIFICATION_CODE) {
                    sendReactMessage("verifySmsFail",null);
                }else if (event == SMSSDK.EVENT_GET_VERIFICATION_CODE){
                    sendReactMessage("sendSmsFail",null);
                }
            }
        }
    };

    /**
     * 发送验证码到指定的手机
     * @param phone
     */
    @ReactMethod
    public void sendSms(String phone){
        SMSSDK.getVerificationCode("86",phone);
    }

    @ReactMethod
    public void verifySms(String phone,String code){
        SMSSDK.submitVerificationCode("86",phone,code);
    }

    @ReactMethod
    public void openDiyuApplication(String username,String password){ //跳转到第宇app
        try {
            Intent i = new Intent();
            ComponentName componentName = new ComponentName("com.pureman.dysmart", "com.pureman.dysmart.HomeActivity");
            i.putExtra("username", username);
            i.putExtra("password", password);
            i.setComponent(componentName);
            i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            currentReactContext.startActivity(i);
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void openInfoManagerActivity(int userid,String data,String currentUnit,String token){
        Intent i = new Intent();
        i.setClass(currentReactContext, InfoManagerActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        i.putExtra("data",data);
        i.putExtra("currentUnit",currentUnit);
        i.putExtra("userid",userid);
        i.putExtra("token",token);
        currentReactContext.startActivity(i);
    }
}
