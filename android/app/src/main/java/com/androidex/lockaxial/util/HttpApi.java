package com.androidex.lockaxial.util;

import android.app.Dialog;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.drawable.Drawable;
import android.hardware.Camera;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.widget.ImageView;
import android.widget.TextView;

import com.androidex.R;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.drawable.GlideDrawable;
import com.bumptech.glide.request.animation.GlideAnimation;
import com.bumptech.glide.request.target.SimpleTarget;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * Created by Administrator on 2018/5/19.
 */

public class HttpApi {
    private static HttpApi api;
    private static OkHttpClient client;
    public static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");
    public static HttpApi getInstance(){
        if(api == null){
            api = new HttpApi();
            client = new OkHttpClient();
        }
        return api;
    }


    public String loadHttpforGet(String u,String t){
        try {
            Log.i("xiao_","发出请求："+u);
            Call call = client.newCall(BuildRequest(null, u, t));
            Response response = call.execute();
            if(response.isSuccessful()){
                return response.body().string();
            }else{
                return null;
            }
        }catch(Exception e){
            return null;
        }
    }

    public void loadHttpforGet(String u,String t,Callback callback){
        try {
            client.newCall(BuildRequest(null, u, t)).enqueue(callback);
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    public String loadHttpforPost(String u, JSONObject j, String t) throws Exception{
        try {
            RequestBody body = RequestBody.create(JSON, j.toString());
            Call call = client.newCall(BuildRequest(body, u, t));
            return call.execute().body().string();
        }catch(Exception e){
            return null;
        }
    }

    private Request BuildRequest(RequestBody body, String url, String token){
        Request.Builder builder= new Request.Builder()
                .url(url)
                .header("Accept", "application/json")
                .header("Content-Type", "application/json");
        if(token!=null && token.length()>0){
            builder.header("Authorization","Bearer " + token);
        }
        if(body!=null){
            builder.post(body);
        }
        return builder.build();
    }

    public static String UTCStringtODefaultString(String UTCString) {
        try {
            UTCString = UTCString.replace("Z", " UTC");
            SimpleDateFormat utcFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS Z");
            SimpleDateFormat defaultFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date date = utcFormat.parse(UTCString);
            return defaultFormat.format(date);
        } catch (ParseException pe) {
            pe.printStackTrace();
            return null;
        }
    }

    public static void loadImage(Context context,String url, final ImageView imageView){
        Glide.with(context).load(url).into(new SimpleTarget<GlideDrawable>() {
            @Override
            public void onResourceReady(GlideDrawable resource, GlideAnimation<? super GlideDrawable> glideAnimation) {
                imageView.setImageDrawable(resource);
            }

            @Override
            public void onLoadFailed(Exception e, Drawable errorDrawable) {
                imageView.setImageResource(R.drawable.ic_def_bg);
            }
        });
    }

    public static  File savePictureFile(Context context,byte[] data,int direction){
        Bitmap bitmap = BitmapFactory.decodeByteArray(data, 0, data.length);
        bitmap = BitmapRotate(bitmap,direction);
        //File path = new File(getFilesDir().getPath()+"/IMAGE"); ///sdcard
        File path = new File(context.getFilesDir().getPath()+"/face");
        if(!path.exists()){
            path.mkdirs();
        }
        File file = new File(path.toString(), System.currentTimeMillis() + ".jpg");
        if(!file.exists()){
            try {
                file.createNewFile();
            }catch (Exception e){
                e.printStackTrace();
            }
        }
        try {
            FileOutputStream outputStream = new FileOutputStream(file);
            bitmap.compress(Bitmap.CompressFormat.JPEG, 30, outputStream);
            outputStream.close();
        }catch (Exception e){
            e.printStackTrace();
        }
        return file;
    }

    private static  Bitmap BitmapRotate(Bitmap bitmap,int direction){
        Matrix matrix = new Matrix();
        if(direction == Camera.CameraInfo.CAMERA_FACING_BACK){
            matrix.postRotate(90f);
        }else{
            matrix.postScale(-1f, 1f);
            matrix.postRotate(90f);
        }
        return Bitmap.createBitmap(bitmap,0,0,bitmap.getWidth(),bitmap.getHeight(),matrix,true);
    }

    public static Dialog createDialog(Context context, String msg) {
        Dialog dialog = null;
        dialog = new Dialog(context, R.style.image_dialog);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        View main = View.inflate(context, R.layout.dialog_main, null);
        dialog.setContentView(main);
        TextView tv = (TextView) main.findViewById(R.id.msg);
        tv.setText(msg);
        dialog.setCancelable(false);
        return dialog;
    }

    public static boolean isNetworkAvailable(Context context) {
        ConnectivityManager connectivityManager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (connectivityManager == null) {
            return false;
        } else {
            NetworkInfo[] networkInfo = connectivityManager.getAllNetworkInfo();
            if (networkInfo != null && networkInfo.length > 0) {
                for (int i = 0; i < networkInfo.length; i++) {
                    networkInfo[i].isAvailable();
                    if (networkInfo[i].getState() == NetworkInfo.State.CONNECTED) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
