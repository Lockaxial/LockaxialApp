package com.androidex.lockaxial;

import android.app.Application;
import android.os.Messenger;
import android.support.annotation.Nullable;

import com.androidex.BuildConfig;
import com.androidex.lockaxial.config.DeviceConfig;
import com.androidex.lockaxial.util.ReactBridge;
import com.androidex.lockaxial.util.ReactBridgePackage;
import com.androidex.lockaxial.util.UDPClientBridgePackage;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.i18n.reactnativei18n.ReactNativeI18n;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.reactnativenavigation.NavigationApplication;

import java.util.Arrays;
import java.util.List;

import cn.jpush.reactnativejpush.JPushPackage;
import cn.smssdk.SMSSDK;

public class MainApplication extends NavigationApplication{
    private boolean SHUTDOWN_TOAST = false;
    private boolean SHUTDOWN_LOG = false;

    @Override
    public boolean isDebug() {
        //return BuildConfig.DEBUG;
        return false;
    }

    @Nullable
    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
        Application application=this;
        return Arrays.<ReactPackage> asList(
                //new MainReactPackage(),
                new PickerPackage(),
                new VectorIconsPackage(),
                new ReactNativeI18n(),
                new ReactBridgePackage(),
                new UDPClientBridgePackage(),
                new JPushPackage(true, true)
        );
    }

    private Messenger mainServiceMessenger=null;

    public void setMainServiceMessenger(Messenger mainServiceMessenger){
        this.mainServiceMessenger=mainServiceMessenger;
    }

    public Messenger getMainServiceMessenger(){
        return this.mainServiceMessenger;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        //initPushService();
        SMSSDK.initSDK(this, DeviceConfig.SMS_APPKEY,DeviceConfig.SMS_APPSECRET);
        SMSSDK.registerEventHandler(ReactBridge.eventHandler); //注册短信回调
    }
    /*
    private void initPushService(){
        PushAgent mPushAgent = PushAgent.getInstance(this);
        //注册推送服务，每次调用register方法都会回调该接口
        mPushAgent.register(new IUmengRegisterCallback() {

            @Override
            public void onSuccess(String deviceToken) {
                //注册成功会返回device token
                Log.v("MainService","---->get push device token<-----------"+deviceToken);
            }

            @Override
            public void onFailure(String s, String s1) {
                Log.v("MainService","---->get push device token error<-----------"+s+s1);
            }
        });
    }*/
}
