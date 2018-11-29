package com.androidex.lockaxial;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.view.SurfaceView;
import android.view.View;

import com.androidex.R;
import com.androidex.lockaxial.util.CameraHelperDex;
import com.androidex.lockaxial.util.HttpApi;
import com.androidex.lockaxial.util.RegisterEvent;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;

import java.io.File;

/**
 * Created by Administrator on 2018/5/30.
 */

public class FaceAddActivity extends Activity implements CameraHelperDex.CallBack {
    private SurfaceView mSurfaceView;
    private CameraHelperDex cameraHelper;

    private String houseData;
    private String currentUnit;
    private String token;
    private int userid;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_faceadd);
        EventBus.getDefault().register(this);
        houseData = getIntent().getStringExtra("data");
        currentUnit = getIntent().getStringExtra("currentUnit");
        userid = getIntent().getIntExtra("userid",-1);
        token = getIntent().getStringExtra("token");
        mSurfaceView = (SurfaceView) findViewById(R.id.surfaceView);
        cameraHelper = new CameraHelperDex(this,mSurfaceView);
        cameraHelper.addCallBack(this);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        this.finish();
    }

    @Subscribe
    public void onEventMessage(RegisterEvent event){
        if(event.msg.equals("Exit")){
            this.finish();
        }
    }

    public void onPicture(View view){
        cameraHelper.takePic();
    }

    public void onSwitch(View view){
        cameraHelper.exchangeCamera();
    }


    private void startRegisterAcivity(File file){
        Intent i = new Intent(this,FaceRegisterActivity.class);
        i.putExtra("file",file.toString());
        i.putExtra("data",houseData);
        i.putExtra("currentUnit",currentUnit);
        i.putExtra("userid",userid);
        i.putExtra("token",token);
        startActivity(i);
    }

    @Override
    public void onPreviewFrame(byte[] bytes) {

    }

    @Override
    public void onTakePic(byte[] bytes) {
        File file = HttpApi.savePictureFile(this,bytes,cameraHelper.getCameradirection());
        if(file!=null){
            startRegisterAcivity(file);
        }
    }
}
