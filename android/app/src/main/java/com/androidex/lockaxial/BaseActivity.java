package com.androidex.lockaxial;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.Toast;

import com.androidex.R;
import com.androidex.lockaxial.util.HttpApi;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.drawable.GlideDrawable;
import com.bumptech.glide.request.animation.GlideAnimation;
import com.bumptech.glide.request.target.SimpleTarget;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Response;

/**
 * Created by Administrator on 2018/6/1.
 */

public abstract class BaseActivity extends Activity {
    private View v;
    private Dialog dialog;
    boolean isTimeout;
    boolean networkError;
    public Handler mHandler = new Handler(){
        @Override
        public void handleMessage(Message msg) {
            onMessage(msg);
        }
    };

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        initParms(getIntent());
        v = LayoutInflater.from(this).inflate(bindView(), null);
        setContentView(v);
        initView(v);
    }


    @Override
    protected void onDestroy() {
        if (dialog != null) {
            hideLoadingDialog();
            dialog = null;
        }
        super.onDestroy();
    }

    public abstract void initParms(Intent intent);
    public abstract int bindView();
    public abstract void initView(View v);
    public abstract void onMessage(Message msg);

    public void showLoading(String msg) {
        if (dialog == null) {
            dialog = HttpApi.createDialog(this, msg);
        }
        if (dialog != null && !dialog.isShowing()) {
            dialog.show();
        }
    }

    public void hideLoadingDialog() {
        if (dialog != null && dialog.isShowing()) {
            dialog.dismiss();
            dialog = null;
        }
    }

    public void showL(String msg){
        Log.i("xiao_",msg);
    }

    public boolean isNetWork() {
        return HttpApi.isNetworkAvailable(this);
    }

    protected void loadUrlImage(final String url,final ImageView image){
        Glide.with(this).load(url).placeholder(R.drawable.ic_def_bg).error(R.drawable.ic_def_bg).into(new SimpleTarget<GlideDrawable>() {
            @Override
            public void onResourceReady(GlideDrawable resource, GlideAnimation<? super GlideDrawable> glideAnimation) {
                image.setImageDrawable(resource);
            }

            @Override
            public void onLoadFailed(Exception e, Drawable errorDrawable) {
                image.setImageResource(R.drawable.ic_def_bg);
            }
        });
    }

    protected void loadUrlImage(int rid,final ImageView image){
        Glide.with(this).load(rid).placeholder(R.drawable.ic_def_bg).error(R.drawable.ic_def_bg).into(new SimpleTarget<GlideDrawable>() {
            @Override
            public void onResourceReady(GlideDrawable resource, GlideAnimation<? super GlideDrawable> glideAnimation) {
                image.setImageDrawable(resource);
            }

            @Override
            public void onLoadFailed(Exception e, Drawable errorDrawable) {
                image.setImageResource(R.drawable.ic_def_bg);
            }

        });
    }

    public void asyncHttp(final String url,final String token,final AsyncCallBack callBack){
        HttpApi.getInstance().loadHttpforGet(url, token, new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callBack.onResult(null);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                callBack.onResult(response.body().string());
            }
        });
    }

    public void buildAlert(String[] data,DialogInterface.OnClickListener onClickListener){
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setItems(data,onClickListener);
        builder.create().show();
    }

    public void showToast(final String msg){
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(BaseActivity.this,msg,Toast.LENGTH_SHORT).show();
            }
        });
    }

    interface AsyncCallBack{
        public void onResult(String result);
    }

    public String UTCStringtODefaultString(String UTCString) {
        try {
            UTCString = UTCString.replace("Z", " UTC");
            SimpleDateFormat utcFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS Z");
            SimpleDateFormat defaultFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            Date date = utcFormat.parse(UTCString);
            return defaultFormat.format(date);
        } catch (ParseException pe) {
            pe.printStackTrace();
            return null;
        }
    }

}
