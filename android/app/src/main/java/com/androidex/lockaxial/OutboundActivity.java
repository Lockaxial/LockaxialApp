package com.androidex.lockaxial;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.util.Log;
import android.view.SurfaceView;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.androidex.R;
import com.androidex.lockaxial.service.MainService;


public class OutboundActivity extends Activity {
    private static final String TAG = "OutboundActivity";
    public static final int MSG_RTC_ONVIDEO_OUT = 10001;
    public static final int MSG_RTC_DISCONNECT = 10002;
    public static final int MSG_RTC_CONNECTED = 10003;

    public static final int CALL_MODE = 1;
    public static final int ONCONNECTED_MODE = 2;
    public static final int ONVIDEO_MODE = 4;

    protected Messenger serviceMessenger;
    protected Messenger outboundMessenger;
    protected Handler handler = null;

    public static int currentStatus = CALL_MODE;
    public static Activity instance = null;

    TextView callingText = null;
    TextView switchMicText = null;

    SurfaceView remoteView = null;
    SurfaceView localView = null;
    LinearLayout remoteLayout;
    LinearLayout localLayout;

    RelativeLayout callingLayout = null;
    RelativeLayout speakingLayout = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_outbound);
        instance = this;
        initScreen();
        initHandler();
        Intent intent = new Intent(OutboundActivity.this, MainService.class);
        bindService(intent, connection, 0);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        sendMainMessenge(MainService.MSG_CLOSE_CALL);
        unbindService(connection);
    }

    private void initHandler() {
        handler = new Handler() {
            @Override
            public void handleMessage(Message msg) {
                if (msg.what == MSG_RTC_ONVIDEO_OUT) {
                    Log.e(TAG, "音频通话--");
                    onRtcVideoOn();
                } else if (msg.what == MSG_RTC_CONNECTED) {
                    Log.e(TAG, "RTC连接成功--");
                    onRtcConnected();
                } else if (msg.what == MSG_RTC_DISCONNECT) {
                    Log.e(TAG, "RTC断开连接--");
                    onRtcDisconnect();
                }
            }
        };
        outboundMessenger = new Messenger(handler);
    }

    protected void sendMainMessenge(int code) {
        Message message = Message.obtain();
        message.what = code;
        try {
            serviceMessenger.send(message);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    protected void sendMainMessenge(int code, Object object) {
        Message message = Message.obtain();
        message.what = code;
        message.obj = object;
        try {
            serviceMessenger.send(message);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    protected void sendOutboundMessenge(int code, Object object) {
        Message message = Message.obtain();
        message.what = code;
        message.obj = object;
        try {
            outboundMessenger.send(message);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    private ServiceConnection connection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            //获取Service端的Messenger
            serviceMessenger = new Messenger(service);
            Message message = Message.obtain();
            message.what = MainService.REGISTER_ACTIVITY_OUTBOUND;
            message.replyTo = outboundMessenger;
            try {
                //通过ServiceMessenger将注册消息发送到Service中的Handler
                serviceMessenger.send(message);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
        }
    };

    protected void initScreen() {
        speakingLayout = (RelativeLayout) findViewById(R.id.speakingLayout);
        callingLayout = (RelativeLayout) findViewById(R.id.callingLayout);
        callingLayout.setVisibility(View.VISIBLE);
        speakingLayout.setVisibility(View.INVISIBLE);
        callingText = (TextView) findViewById(R.id.callingText);
        callingText.setText("正在拨打中...");

        remoteLayout = (LinearLayout) findViewById(R.id.remoteLayout);
        localLayout = (LinearLayout) findViewById(R.id.localLayout);
        switchMicText = (TextView) findViewById(R.id.switchMicText);
        switchMicText.setText("免提");
    }

    synchronized void setCurrentStatus(int status) {
        currentStatus = status;
    }

    void setTextView(int id, String txt) {
        ((TextView) findViewById(id)).setText(txt);
    }

    void initVideoViews() {
        if (remoteView != null) return;
        if (MainService.callConnection != null) {
            remoteView = (SurfaceView) MainService.callConnection.createVideoView(false, this, true);
            localView = (SurfaceView) MainService.callConnection.createVideoView(true, this, true);
        }
        remoteLayout.addView(remoteView);
        remoteView.setKeepScreenOn(true);
        remoteView.setZOrderMediaOverlay(true);
        remoteView.setZOrderOnTop(true);

        localLayout.addView(localView);
        localView.setKeepScreenOn(true);
        localView.setZOrderMediaOverlay(true);
        localView.setZOrderOnTop(true);
    }

    public void onRtcVideoOn() {
        setCurrentStatus(ONVIDEO_MODE);
        callingLayout.setVisibility(View.INVISIBLE);
        speakingLayout.setVisibility(View.VISIBLE);
        initVideoViews();
        MainService.callConnection.buildVideo(remoteView);
        MainService.callConnection.buildVideo(localView);
    }

    public void onRtcDisconnect() {
        setCurrentStatus(CALL_MODE);
        close();
    }

    /**
     *
     */
    public void onRtcConnected() {
        setCallingText("正在通话中...");
        setCurrentStatus(ONCONNECTED_MODE);
    }

    protected void close() {
        if (instance != null) {
            instance.finish();
            instance = null;
        }
    }

    public void rejectCall(View view) {
        sendMainMessenge(MainService.MSG_REJECT_CALL);
        close();
    }

    public void switchMic(View view) {
        if (switchMicText.getText().equals("免提")) {
            switchMicText.setText("听筒");
        } else {
            switchMicText.setText("免提");
        }
        sendMainMessenge(MainService.MSG_SWITCH_MIC);
    }

    private void setCallingText(final String value) {
        handler.post(new Runnable() {
            @Override
            public void run() {
                callingText.setText(value);
            }
        });
    }
}
