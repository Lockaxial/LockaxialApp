package com.androidex.lockaxial.service;

import android.app.AlertDialog;
import android.app.Dialog;
import android.app.Service;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.util.Log;
import android.view.WindowManager;

import com.androidex.R;
import com.androidex.lockaxial.InboundActivity;
import com.androidex.lockaxial.MainApplication;
import com.androidex.lockaxial.OutboundActivity;
import com.androidex.lockaxial.config.DeviceConfig;
import com.androidex.lockaxial.util.BleHandler;
import com.androidex.lockaxial.util.ReactBridge;
import com.androidex.lockaxial.util.WifiEvent;
import com.androidex.lockaxial.util.WifiHandler;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;

import jni.http.HttpManager;
import jni.http.HttpResult;
import jni.http.RtcHttpClient;
import rtc.sdk.clt.RtcClientImpl;
import rtc.sdk.common.RtcConst;
import rtc.sdk.common.SdkSettings;
import rtc.sdk.core.RtcRules;
import rtc.sdk.iface.ClientListener;
import rtc.sdk.iface.Connection;
import rtc.sdk.iface.ConnectionListener;
import rtc.sdk.iface.Device;
import rtc.sdk.iface.DeviceListener;
import rtc.sdk.iface.RtcClient;

/**
 * 程序的主要后台服务
 */
public class MainService extends Service implements WifiEvent {
    private static final String TAG = "MainService";
    public static final int REGISTER_ACTIVITY_MAIN = 1; //MainActivity绑定Service的消息编号
    public static final int REGISTER_ACTIVITY_INBOUND = 2; //InboundActivity绑定Service的消息编号
    public static final int REGISTER_ACTIVITY_OUTBOUND = 3; //OutboundActivity绑定Service的消息编号
    public static final int MSG_SERVER_INFO = 10000; //开始连接RTC服务器消息编号10001
    public static final int MSG_CONNECT_RTC = 10001; //开始连接RTC服务器消息编号
    public static final int MSG_RELEASE_RTC = 10002; //开始关闭RTC服务器
    public static final int MSG_GETTOKEN = 20001; //获取RTC服务器的token
    public static final int MSG_OPEN_DOOR = 20030; //开门消息编号
    public static final int MSG_OPEN_RTC = 20031; //打开视频对讲消息编号
    public static final int MSG_REJECT_CALL = 20032; //拒绝接听消息编号
    public static final int MSG_CLOSE_CALL = 20035; //挂断接听消息编号
    public static final int MSG_OPEN_LOCK = 20033; //直接开门消息编号
    public static final int MSG_SWITCH_MIC = 20034;//切换免提
    public static final int MSG_CHECK_RTC_STATUS = 40001; //查看RTC连接状态
    public static final int MSG_CALL_INDOOR = 50001; //呼叫室内机
    public static final int MSG_CALL_ADMIN_CENTER = 50002; //呼叫管理中心

    public static final int MSG_SCAN_BLE_LOCK = 60001; //扫描蓝牙门禁设备
    public static final int MSG_OPEN_BLE_LOCK = 60002; //发送打开蓝牙门禁请求
    public static final int MSG_OPEN_BLE_LOCK_FAILED = 60003; //打开蓝牙门禁失败
    public static final int MSG_OPEN_BLE_LOCK_SUCCESS = 60004; //打开蓝牙门禁失败
    public static final int MSG_FIND_BLE_LOCK = 60005; //扫描蓝牙门禁设备
    public static final int MSG_STOP_BLE_SCAN = 60006; //扫描蓝牙门禁设备

    /************结点科技提供的账号****************/
    public static final String APP_ID = "71012";
    public static final String APP_KEY = "71007b1c-6b75-4d6f-85aa-40c1f3b842ef";
    /*************肖泽东申请的账号****************/
//  public static final String APP_ID = "71986";
//  public static final String APP_KEY = "c9f8f45f-d3ad-4876-b5fd-78f5796dab59";

    public static final String RTC_TOKEN_STORAGE = "RTC_TOKEN_STORAGE";
    public static final String RTC_TOKEN_KEY = "RTC_TOKEN_KEY";
    public static final String RTC_TOKEN_DATE = "RTC_TOKEN_DATE";
    public static String RTC_ACCOUNT_NAME = null;

    int rtcStatus = 0; //0:初始状态 1：获得账号 2：  9:失去网络 10:正常
    RtcClient rtcClient = null;
    Device device = null;
    public static Connection callConnection;
    private String token = null;
    private String deviceMac = null;
    private String username = null;
    protected Call call = new Call();
    protected String lastOpenedCallUuid = null;
    private MediaPlayer ringingPlayer;
    private int micFlag = 0;

    protected Messenger mainMessenger = null;
    protected Messenger inboundMessenger = null;
    protected Messenger outboundMessenger = null;
    protected Messenger serviceMessenger = null;
    protected Handler handler = null;

    private WifiHandler wifiHandler = null;
    private BleHandler bleHandler = null;

    public MainService() {
    }

    @Override
    public void onCreate() {
        Log.v("MainService", "------>create Main Service<-------");
        initHandler();
        initRingPlayer();
        initWifiHandler();
        if (RTC_ACCOUNT_NAME != null) {
            Log.v("MainService", "------>get the rtc account name and send message<-------" + RTC_ACCOUNT_NAME);
            sendMessenge(MSG_CONNECT_RTC, RTC_ACCOUNT_NAME);
        }
    }

    protected void initRingPlayer() {
        try {
            ringingPlayer = MediaPlayer.create(this, R.raw.ring);
            //ringingPlayer.prepare();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    protected void initWifiHandler() {
        wifiHandler = new WifiHandler(this, this);
        try {
            wifiHandler.initLockWifi(DeviceConfig.LIFT_WIFI_SSID, DeviceConfig.LIFT_WIFI_PASSWORD);
        } catch (Exception e) {
        }
        wifiHandler.startChecking(DeviceConfig.LIFT_WIFI_SSID);
    }

    protected void initBleHandler() {
        bleHandler = new BleHandler(this, handler);
    }

    public void onStatusChanged(int status) {
        WritableMap params = Arguments.createMap();
        params.putInt("liftStatus", status);
        ReactBridge.sendReactMessage("changeLiftStatus", params);
    }

    protected void sendLiftStatusToReact() {
        WritableMap params = Arguments.createMap();
        params.putInt("liftStatus", this.wifiHandler.getLiftStatus());
        ReactBridge.sendReactMessage("changeLiftStatus", params);
    }

    protected void startRing() {
        ringingPlayer.start();
    }

    protected void stopRing() {
        ringingPlayer.pause();
        try {
            ringingPlayer.seekTo(0);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    protected void initHandler() {
        handler = new Handler() {
            @Override
            public void handleMessage(Message msg) {
                if (msg.what == REGISTER_ACTIVITY_MAIN) {
                    Log.i("MainService", "register Main messenger");
                    mainMessenger = msg.replyTo;
                } else if (msg.what == REGISTER_ACTIVITY_INBOUND) {
                    Log.i("MainService", "register Inbound messenger");
                    inboundMessenger = msg.replyTo;
                } else if (msg.what == REGISTER_ACTIVITY_OUTBOUND) {
                    Log.i("MainService", "register Outbound messenger");
                    outboundMessenger = msg.replyTo;
                    openRtc("video");
                } else if (msg.what == MSG_SERVER_INFO) {
                    DeviceConfig.SERVER_URL = (String) msg.obj;
                    initBleHandler();
                } else if (msg.what == MSG_CONNECT_RTC) {
                    Log.e(TAG, "RTC连接");
                    onOpenRtc((String) msg.obj);
                } else if (msg.what == MSG_RELEASE_RTC) {
                    rtcLogout();
                } else if (msg.what == MSG_GETTOKEN) {
                    onResponseGetToken(msg);
                } else if (msg.what == MSG_REJECT_CALL) {//拒绝
                    Log.e(TAG, "拒绝");
                    refuseDial();
                } else if (msg.what == MSG_CLOSE_CALL) {//挂断
                    Log.e(TAG, "挂断");
                    closeDial();
                } else if (msg.what == MSG_OPEN_RTC) {
                    Log.e(TAG, "打开RTC");
                    openRtc((String) msg.obj);
                } else if (msg.what == MSG_OPEN_DOOR) {
                    openDoor();
                } else if (msg.what == MSG_OPEN_LOCK) {
                    showOpenDoorOption((String) msg.obj);
                } else if (msg.what == MSG_SWITCH_MIC) {
                    switchMic();
                } else if (msg.what == MSG_CHECK_RTC_STATUS) {
                    sendRtcStatusToReact();
                } else if (msg.what == MSG_CALL_INDOOR) {
                    String deviceKey = (String) msg.obj;
                    openTalk(deviceKey);
                } else if (msg.what == MSG_CALL_ADMIN_CENTER) {
                    String deviceKey = (String) msg.obj;
                    openTalk(deviceKey);
                } else if (msg.what == MSG_SCAN_BLE_LOCK) {
                    //bleHandler.startScan();
                } else if (msg.what == MSG_STOP_BLE_SCAN) {
                    //bleHandler.stopScan();
                } else if (msg.what == MSG_FIND_BLE_LOCK) {
                    String deviceName = (String) msg.obj;
                    WritableMap params = Arguments.createMap();
                    params.putString("deviceName", deviceName);
                    ReactBridge.sendReactMessage("findBleDevice", params);
                } else if (msg.what == MSG_OPEN_BLE_LOCK) {
                    String value = (String) msg.obj;
                    String[] values = value.split("-");
                    String deviceName = values[0];
                    String username = values[1];
                    String unitNo = values[2];
                    //bleHandler.openBleLock(deviceName, username, unitNo);
                } else if (msg.what == MSG_OPEN_BLE_LOCK_FAILED) {
                    int code = (Integer) msg.obj;
                    WritableMap params = Arguments.createMap();
                    params.putInt("code", code);
                    ReactBridge.sendReactMessage("openBleLockFailed", params);
                } else if (msg.what == MSG_OPEN_BLE_LOCK_SUCCESS) {
                    ReactBridge.sendReactMessage("openBleLockSuccess", null);
                }
            }
        };
        serviceMessenger = new Messenger(handler);
        MainApplication app = (MainApplication) this.getApplication();
        ReactBridge.serviceMessenger = serviceMessenger;
    }


    private Dialog openDoorAlert;
    private String[] openOption = {"主门","副门","主门和副门"};
    private void showOpenDoorOption(final String lockKey){
        if(openDoorAlert == null){
            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            builder.setItems(openOption, new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialogInterface, int i) {
                    String[] tempValue = lockKey.split("-");
                    String key = tempValue[0];
                    String unitNo = null;
                    if (tempValue.length > 1) {
                        unitNo = tempValue[1];
                    }
                    openLock(key, unitNo,i);
                }
            });
            openDoorAlert = builder.create();
            openDoorAlert.getWindow().setType(WindowManager.LayoutParams.TYPE_SYSTEM_ALERT);
        }
        openDoorAlert.show();
    }

    private void switchMic() {
        if (rtcClient != null) {
            AudioManager audioManager = (AudioManager) getSystemService(Service.AUDIO_SERVICE);
            if (micFlag == 0) {
                micFlag = 1;
                rtcClient.enableSpeaker(audioManager, true);
            } else {
                micFlag = 0;
                rtcClient.enableSpeaker(audioManager, false);
            }
        }
    }

    /**
     * 设置RTC状态
     *
     * @param status
     * @return
     */
    private synchronized int setRtcStatus(int status) {
        if (status != 0) {
            if (status != rtcStatus) {
                rtcStatus = status;
            }
        }
        return rtcStatus;
    }

    /**
     * 停止呼叫
     */
    protected void closeCallingConnection() {
        if (callConnection != null) {
            callConnection.disconnect();
            callConnection = null;
            callingDisconnect();
        }
    }

    /**
     * 初始化连接
     */
    private void initRtcClient() {
        rtcClient = new RtcClientImpl();
        rtcClient.initialize(this.getApplicationContext(), new ClientListener() {
            @Override   //初始化结果回调
            public void onInit(int result) {
                Log.v(TAG, "onInit,result=" + result);//常见错误9003:网络异常或系统时间差的太多
                if (result == 0) {
                    setRtcStatus(2); //初始化成功
                    rtcClient.setAudioCodec(RtcConst.ACodec_OPUS);
                    rtcClient.setVideoCodec(RtcConst.VCodec_VP8);
                    rtcClient.setVideoAttr(100);
                    startGetToken();
                } else {
                    Log.v(TAG, "onInit error -------------- result=" + result);//常见错误9003:网络异常或系统时间差的太多
                    onInitRtcError();
                }
            }
        });
    }

    protected void onInitRtcError() {
        new Thread() {
            public void run() {
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                }
                initRtcClient();
            }
        }.start();
    }

    private void onOpenRtc(String username) {
        Log.v(TAG, "------>get open rtc message from<-------" + username);
        if (this.username == null || !username.equals(this.username)) {
            Log.v(TAG, "------>init RTC<-------" + username);
            setRtcStatus(1); //设置状态，获取到用户账号
            this.username = username;
            initRtcClient();
        }
    }

    /**
     * 获取TOKEN
     *
     * @param msg
     */
    private void onResponseGetToken(Message msg) {
        HttpResult ret = (HttpResult) msg.obj;
        Log.v("MainService", "handleMessage getCapabilityToken status:" + ret.getStatus());
        JSONObject jsonrsp = (JSONObject) ret.getObject();
        if (jsonrsp != null && jsonrsp.isNull("code") == false) {
            try {
                String code = jsonrsp.getString(RtcConst.kcode);
                String reason = jsonrsp.getString(RtcConst.kreason);
                Log.v("MainService", "Response getCapabilityToken code:" + code + " reason:" + reason);
                if (code.equals("0")) {
                    token = jsonrsp.getString(RtcConst.kcapabilityToken);
                    Log.v("MainService", "handleMessage getCapabilityToken:" + token);
                    saveTokenToLocal();
                    setRtcStatus(3); //成功获得token
                    rtcRegister();
                } else {
                    onGetTokenError();
                    Log.v("MainService", "获取token失败 [status:" + ret.getStatus() + "]" + ret.getErrorMsg());
                }
            } catch (JSONException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
                onGetTokenError();
                Log.v("MainService", "获取token失败 [status:" + e.getMessage() + "]");
            }
        } else {
            onGetTokenError();
        }
    }

    protected void onGetTokenError() {
        new Thread() {
            public void run() {
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                }
                startGetToken();
            }
        }.start();
    }

    /**
     * 终端直接从rtc平台获取token，应用产品需要通过自己的服务器来获取，rtc平台接口请参考开发文档<2.5>章节.
     */
    private void getTokenFromServer() {
        RtcConst.UEAPPID_Current = RtcConst.UEAPPID_Self;//账号体系，包括私有、微博、QQ等，必须在获取token之前确定。
        JSONObject jsonobj = HttpManager.getInstance().CreateTokenJson(0, username, RtcHttpClient.grantedCapabiltyID, "");
        HttpResult ret = HttpManager.getInstance().getCapabilityToken(jsonobj, APP_ID, APP_KEY);
        sendMessenge(MSG_GETTOKEN, ret);
    }

    private void clearTokenFromLocal() {
        SharedPreferences sharedPref = this.getSharedPreferences(RTC_TOKEN_STORAGE, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.remove(RTC_TOKEN_KEY);
        editor.remove(RTC_TOKEN_DATE);
        editor.commit();
    }

    private void saveTokenToLocal() {
        SharedPreferences sharedPref = this.getSharedPreferences(RTC_TOKEN_STORAGE, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString(RTC_TOKEN_KEY, token);
        editor.putLong(RTC_TOKEN_DATE, new Date().getTime());
        editor.commit();
    }

    private boolean getTokenFromLocal() {
        boolean isTokenAvailable = false;
        SharedPreferences sharedPref = this.getSharedPreferences(RTC_TOKEN_STORAGE, Context.MODE_PRIVATE);
        String thisToken = sharedPref.getString(RTC_TOKEN_KEY, null);
        long thisDate = sharedPref.getLong(RTC_TOKEN_DATE, 0);
        if (thisToken != null) {
            long nowTime = new Date().getTime();
            if ((nowTime - thisDate) / (1000 * 60 * 60 * 24) < 20) {
                token = thisToken;
                isTokenAvailable = true;
            }
        }
        return false;
    }

    private void startGetToken() {
        Log.v("MainService", "try to get token for " + username);
        if (getTokenFromLocal()) {
            setRtcStatus(3); //成功获得token
            rtcRegister();
        } else {
            new Thread() {
                public void run() {
                    getTokenFromServer();
                }
            }.start();
        }
    }

    private void rtcRegister() {
        Log.v("MainService", "rtcRegister:" + username + "token:" + token);
        if (token != null) {
            try {
                JSONObject jargs = SdkSettings.defaultDeviceSetting();
                jargs.put(RtcConst.kAccPwd, token);
                //账号格式形如“账号体系-号码~应用id~终端类型”，以下主要设置账号内各部分内容，其中账号体系的值要在获取token之前确定，默认为私有账号
                jargs.put(RtcConst.kAccAppID, APP_ID);//应用id
                jargs.put(RtcConst.kAccUser, username); //号码
                jargs.put(RtcConst.kAccType, RtcConst.UEType_Current);//终端类型
                jargs.put(RtcConst.kAccRetry, 5);//设置重连时间
                device = rtcClient.createDevice(jargs.toString(), deviceListener); //注册
                setRtcStatus(10); //注册成功
                onRegisterCompleted();
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }

    private void rtcDisconnect() {
        if (rtcClient != null) {
            rtcClient.release();
            rtcClient = null;
        }
        if (device != null) {
            device.release();
            device = null;
        }
    }

    private void rtcLogout() {
        rtcDisconnect();
        clearTokenFromLocal();
        this.username = null;
    }

    protected void onRegisterCompleted() {
        //将最新的状态发给react端
        sendRtcStatusToReact();
    }

    protected void sendRtcStatusToReact() {
        sendLiftStatusToReact();
        sendRtcStatusToReact(0);
    }

    /**
     * @param status
     */
    protected void sendRtcStatusToReact(int status) {

        WritableMap params = Arguments.createMap();
        params.putInt("rtcStatus", setRtcStatus(status));
        ReactBridge.sendReactMessage("changeRtcStatus", params);
    }

    protected void startInboundActivity(Call call) {
        if (InboundActivity.instance == null) {
            Intent intent = new Intent(getBaseContext(), InboundActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.putExtra("imageUrl", call.imageUrl);
            intent.putExtra("unitName", call.unitName);
            intent.putExtra("communityName", call.communityName);
            intent.putExtra("lockName", call.lockName);
            startActivity(intent);
        }
    }

    protected void stopInboundActivity() {
        if (InboundActivity.instance != null) {
            InboundActivity.instance.finish();
            InboundActivity.instance = null;
        }
        inboundMessenger = null;
    }

    protected void startOutboundActivity() {
        stopOutboundActivity();
        Intent intent = new Intent(getBaseContext(), OutboundActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }

    protected void stopOutboundActivity() {
        if (OutboundActivity.instance != null) {
            OutboundActivity.instance.finish();
            OutboundActivity.instance = null;
        }
        outboundMessenger = null;
    }

    protected void sendMessenge(int code, Object object) {
        Message message = handler.obtainMessage();
        message.what = code;
        message.obj = object;
        handler.sendMessage(message);
    }

    protected void sendInboundMessenge(int code, Object object) {
        if (inboundMessenger != null) {
            Message message = Message.obtain();
            message.what = code;
            message.obj = object;
            try {
                inboundMessenger.send(message);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
    }

    protected void sendOutboundMessenge(int code, Object object) {
        if (outboundMessenger != null) {
            Message message = Message.obtain();
            message.what = code;
            message.obj = object;
            try {
                outboundMessenger.send(message);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * The m a listener.
     */
    DeviceListener deviceListener = new DeviceListener() {
        @Override
        public void onDeviceStateChanged(int result) {
            Log.v("MainService", "onDeviceStateChanged,result=" + result);
            if (result == RtcConst.CallCode_Success) { //注销也存在此处
                onConnectSuccess();
            } else if (result == RtcConst.NoNetwork || result == RtcConst.CallCode_Network) {
                onNoNetWork();
            } else if (result == RtcConst.CallCode_Timeout) {
                onConnectTimeout();
            } else if (result == RtcConst.ChangeNetwork) {
                changeNetWork();
            } else if (result == RtcConst.PoorNetwork) {
                onPoorNetWork();
            } else if (result == RtcConst.ReLoginNetwork) {
                // 网络原因导致多次登陆不成功，由用户选择是否继续，如想继续尝试，可以重建device
                Log.v("MainService", "onDeviceStateChanged,ReLoginNetwork");
                onConnectError();
            } else if (result == RtcConst.DeviceEvt_KickedOff) {
                // 被另外一个终端踢下线，由用户选择是否继续，如果再次登录，需要重新获取token，重建device
                Log.v("MainService", "onDeviceStateChanged,DeviceEvt_KickedOff");
                onConnectError();
            } else if (result == RtcConst.DeviceEvt_MultiLogin) {
                Log.v("MainService", "onDeviceStateChanged,DeviceEvt_MultiLogin");
            } else {
                //  CommFunc.DisplayToast(MyApplication.this, "注册失败:"+result);
            }
        }

        private void onPoorNetWork() {
            Log.v("MainService", "onPoorNetWork");
        }

        private void onConnectSuccess() {
            sendRtcStatusToReact(10);
        }

        private void onConnectError() {
            sendRtcStatusToReact(9);
        }

        private void onConnectTimeout() {
            onConnectError();
            rtcDisconnect();
            initRtcClient();
        }

        private void onNoNetWork() {
            Log.v("MainService", "onNoNetWork");
            //断网销毁
            closeCallingConnection();
            onConnectError();
        }

        private void changeNetWork() {
            Log.v("MainService", "changeNetWork");
            //自动重连接
        }

        @Override
        public void onNewCall(Connection call) {
        }

        @Override
        public void onQueryStatus(int status, String paramers) {
            // TODO Auto-generated method stub
        }

        @Override
        public void onSendIm(int status) {
            if (status == RtcConst.CallCode_Success) {
                ReactBridge.sendReactMessage("reactSendImSuccess", null);
            } else {
                ReactBridge.sendReactMessage("reactSendImFailed", null);
            }
        }

        @Override
        public void onReceiveIm(String from, String mime, String content) {
            JSONObject msg = null;
            String command = "";
            String unitName = "";
            String imageUrl = "";
            String imageUuid = "";
            String communityName = "";
            String lockName = "";
            try {
                msg = new JSONObject(content);
                command = msg.getString("command");
                try {
                    imageUrl = msg.getString("imageUrl");
                } catch (Exception e) {
                }
                try {
                    imageUuid = msg.getString("imageUuid");
                } catch (Exception e) {
                }
                try {
                    communityName = msg.getString("communityName");
                } catch (Exception e) {
                }
                try {
                    lockName = msg.getString("lockName");
                } catch (Exception e) {
                }
            } catch (JSONException e) {
            }
            if (command.equals("call")) {
                call.from = from;
                call.unitName = unitName;
                call.imageUrl = imageUrl;
                call.imageUuid = imageUuid;
                call.communityName = communityName;
                call.lockName = lockName;
                call.status = "N";
                openDial();
            } else if (command.equals("appendImage")) {
                if (call.from.equals(from) && call.imageUuid.equals(imageUuid)) {
                    call.imageUrl = imageUrl;
                    appendImage(imageUrl);
                } else if (imageUuid.equals(lastOpenedCallUuid)) {
                    sendAppendImageToServer(imageUuid, imageUrl);
                }
            } else if (command.equals("cancelCall")) {
                if (call.from.equals(from)) {
                    refuseDial();
                }
            } else if (command.equals("useCoupon")) {
                int couponId = 0;
                WritableMap params = Arguments.createMap();
                try {
                    couponId = msg.getInt("couponId");
                    params.putInt("couponId", couponId);
                } catch (Exception e) {
                }
                ReactBridge.sendReactMessage("useCoupon", params);
            } else {
                ReactBridge.sendReactMessage(command, null);
            }
        }
    };

    ConnectionListener connectionListener = new ConnectionListener() {
        @Override
        public void onConnecting() {

        }

        @Override
        public void onConnected() {
            if (call.status.equals("N")) {
                Log.e(TAG, "连接完成 视频对讲");
                sendInboundMessenge(InboundActivity.MSG_RTC_CONNECTED, null);
            } else {
                Log.e(TAG, "连接完成 音频对讲");
                sendOutboundMessenge(OutboundActivity.MSG_RTC_CONNECTED, null);
            }
        }

        @Override
        public void onDisconnected(int code) {
            Log.e(TAG, "断开连接 code=" + code);
            Log.v(TAG, "onDisconnected timerDur" + callConnection.getCallDuration());
            callConnection = null;
            callingDisconnect();
            if (code != RtcConst.CallCode_Bye) {
                if (call.status.equals("N")) {
                    ReactBridge.sendReactMessage("onCallFailed", null);
                } else {
                    ReactBridge.sendReactMessage("onTalkFailed", null);
                }
            }
        }

        @Override
        public void onVideo() {
            if (call.status.equals("N")) {
                Log.e(TAG, "视频连接");
                sendInboundMessenge(InboundActivity.MSG_RTC_ONVIDEO_IN, null);
            } else {
                Log.e(TAG, "音频连接");
                sendOutboundMessenge(OutboundActivity.MSG_RTC_ONVIDEO_OUT, null);
            }
        }

        @Override
        public void onNetStatus(int msg, String info) {
            // TODO Auto-generated method stub
        }
    };

    private void callingDisconnect() {
        if (call.status.equals("N")) {
            Log.e(TAG, "视频断开连接");
            sendInboundMessenge(InboundActivity.MSG_RTC_DISCONNECT, null);
        } else {
            Log.e(TAG, "音频断开连接");
            sendOutboundMessenge(OutboundActivity.MSG_RTC_DISCONNECT, null);
        }
    }

    private void sendAppendImageToServer(final String imageUuid, final String imageUrl) {
        WritableMap params = Arguments.createMap();
        params.putString("imageUuid", imageUuid);
        params.putString("imageUrl", imageUrl);
        ReactBridge.sendReactMessage("appendCallImage", params);
    }

    /**
     * 接收到呼叫
     */
    protected void openDial() {
        Log.e(TAG, "接收到呼叫");
        startRing();
        startInboundActivity(call);
    }

    protected void appendImage(String imageUrl) {
        sendInboundMessenge(InboundActivity.MSG_APPEND_IMAGE, imageUrl);
    }

    protected void closeDial() {//挂断
        stopRing();
        closeRtc();
        String userUrl = RtcRules.UserToRemoteUri_new(call.from, RtcConst.UEType_Any);
        device.sendIm(userUrl, "text/plain", "reject call");
    }

    protected void refuseDial() {//拒绝
        stopRing();
        closeRtc();
        //String userUrl = RtcRules.UserToRemoteUri_new(call.from, RtcConst.UEType_Any);
        //device.sendIm(userUrl, "text/plain", "refuse call");
        Log.e("call====", "refuse");
    }


    protected void openDoor() {  //拨号开门
        lastOpenedCallUuid = call.imageUuid;
        stopRing();
        closeRtc();
        String userUrl = RtcRules.UserToRemoteUri_new(call.from, RtcConst.UEType_Any);
        String imageAppendValue = "";
        if (call.imageUrl != null && call.imageUrl.length() > 0) {
            imageAppendValue = "-" + call.imageUrl;
        }
        device.sendIm(userUrl, "text/plain", "open the door" + imageAppendValue);
    }

    protected void openLock(String lockKey, String unitNo,int index) { //app直接开门
        String userUrl = RtcRules.UserToRemoteUri_new(lockKey, RtcConst.UEType_Any);
        String append = "";
        if (unitNo != null) {
            append = "-" + unitNo;
        }
        device.sendIm(userUrl, "text/plain", "open the door" + append+"-"+index);
    }

    protected void openTalk(String deviceKey) {
        call.from = deviceKey;
        call.status = "T";
        startOutboundActivity();
    }

    protected void openRtc(String type) {
        stopRing();
        micFlag = 0;
        if (call.status.equals("N") || call.status.equals("T")) {
            JSONObject parameter = new JSONObject();
            String userUrl = RtcRules.UserToRemoteUri_new(call.from, RtcConst.UEType_Any);
            try {
                parameter.put(RtcConst.kCallRemoteUri, userUrl);
                if (type != null && type.equals("voice")) {
                    Log.e(TAG, "音频通话");
                    parameter.put(RtcConst.kCallType, RtcConst.CallType_Audio);
                } else {
                    Log.e(TAG, "视频通话");
                    parameter.put(RtcConst.kCallType, RtcConst.CallType_A_V);
                }
            } catch (JSONException e) {
            }
            callConnection = device.connect(parameter.toString(), connectionListener);
            if (callConnection == null) {
                Log.i("xiao_","callConnection = null");
                closeRtc();
            }else{
                Log.i("xiao_","callConnection != null");
            }
        }
    }

    protected void closeRtc() {
        closeCallingConnection();
        if (call.status.equals("N")) {
            stopInboundActivity();
        } else {
            stopOutboundActivity();
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return serviceMessenger.getBinder();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.v("MainService", "onDestroy()");
        closeCallingConnection();
        if (device != null) {
            device.release();
            device = null;
        }
        if (rtcClient != null) {
            rtcClient.release();
            rtcClient = null;
        }
        if (ringingPlayer != null) {
            ringingPlayer.release();
            ringingPlayer = null;
        }
    }
}

class Call {
    public String from = null;
    public String unitName = null;
    public String status = "N";
    public String imageUrl = null;
    public String imageUuid = null;
    public String communityName = null;
    public String lockName = null;
}