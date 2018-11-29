package com.androidex.lockaxial;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Message;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.View;

import com.androidex.R;

/**
 * Created by Administrator on 2018/5/15.
 */

public class InfoManagerActivity extends BaseActivity {
    private String houseData;
    private String currentUnit;
    private int userid;
    private String token;

    @Override
    public void initParms(Intent intent) {
        houseData = intent.getStringExtra("data");
        currentUnit = intent.getStringExtra("currentUnit");
        userid = intent.getIntExtra("userid",-1);
        token = intent.getStringExtra("token");
    }

    @Override
    public int bindView() {
        return R.layout.activity_infomanager;
    }

    @Override
    public void initView(View v) {

    }

    @Override
    public void onMessage(Message msg) {

    }

    public void openCardData(View v){
        Intent in = new Intent(this,CardActivity.class);
        in.putExtra("data",houseData);
        in.putExtra("currentUnit",currentUnit);
        in.putExtra("userid",userid);
        in.putExtra("token",token);
        startActivity(in);
    }

    public void openFaceData(View v){
        Intent in = new Intent(this,FaceActivity.class);
        in.putExtra("data",houseData);
        in.putExtra("currentUnit",currentUnit);
        in.putExtra("userid",userid);
        in.putExtra("token",token);
        startActivity(in);
    }

}
