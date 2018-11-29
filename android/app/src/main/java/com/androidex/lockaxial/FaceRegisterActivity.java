package com.androidex.lockaxial;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.Window;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.androidex.R;
import com.androidex.lockaxial.util.BitmapUtils;
import com.androidex.lockaxial.util.FaceDB;
import com.androidex.lockaxial.util.HttpApi;
import com.androidex.lockaxial.util.RegisterEvent;
import com.androidex.lockaxial.util.RegisterSubmitAlert;
import com.androidex.lockaxial.util.SubmitEvent;
import com.androidex.lockaxial.util.UploadUtil;
import com.arcsoft.facedetection.AFD_FSDKEngine;
import com.arcsoft.facedetection.AFD_FSDKError;
import com.arcsoft.facedetection.AFD_FSDKFace;
import com.arcsoft.facedetection.AFD_FSDKVersion;
import com.arcsoft.facerecognition.AFR_FSDKEngine;
import com.arcsoft.facerecognition.AFR_FSDKError;
import com.arcsoft.facerecognition.AFR_FSDKFace;
import com.arcsoft.facerecognition.AFR_FSDKVersion;
import com.guo.android_extend.image.ImageConverter;
import com.reactnativenavigation.events.Event;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.json.JSONObject;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by Administrator on 2018/5/30.
 */

public class FaceRegisterActivity extends BaseActivity implements SurfaceHolder.Callback,RegisterSubmitAlert.OnSibmitCallBack{
    private SurfaceView mSurfaceView;
    private SurfaceHolder mSurfaceHolder;
    private String path;
    private Bitmap mBitmap;
    private Rect src = new Rect();
    private Rect dst = new Rect();
    private AFR_FSDKFace mAFR_FSDKFace;
    private static final String TAG = "xiao_";
    private FaceDB faceDB;

    private String houseData;
    private String currentUnit;
    private String token;
    private int userid;
    private String strPhone = "";

    private int roomid = -1;
    private int blockid = -1;
    private int communityId = -1;
    private String faceName;

    @Override
    public void initParms(Intent intent) {
        if(!getPath(intent)){
            showToast("无效图片地址");
            this.finish();
        }
        mBitmap = BitmapUtils.decodeImage(path);
        if(mBitmap == null){
            showToast("无效图片");
            this.finish();
        }
        houseData = intent.getStringExtra("data");
        currentUnit = intent.getStringExtra("currentUnit");
        userid = intent.getIntExtra("userid",-1);
        token = intent.getStringExtra("token");
    }

    @Override
    public int bindView() {
        return R.layout.activity_faceregister;
    }

    @Override
    public void initView(View v) {
        faceDB = new FaceDB(getFilesDir().getPath()+"/face");
        mSurfaceView = (SurfaceView) findViewById(R.id.surfaceView);
        src.set(0, 0, mBitmap.getWidth(), mBitmap.getHeight());
        mSurfaceView.getHolder().addCallback(this);
        new faceThread().start();
    }

    @Override
    public void onMessage(Message msg) {
        switch (msg.what){
            case 0x01:{
                showL("FD初始化失败");
                showToast("系统错误，请联系管理员");
                EventBus.getDefault().post(new RegisterEvent("Exit"));
                finish();
            }break;
            case 0x02:{
                showL("FR初始化失败");
                showToast("系统错误，请联系管理员");
                EventBus.getDefault().post(new RegisterEvent("Exit"));
                finish();
            }break;
            case 0x03:{
                showToast("检查到人脸数据");
                RegisterSubmitAlert registerSubmitAlert = new RegisterSubmitAlert(FaceRegisterActivity.this,R.style.Dialog,houseData,currentUnit,this);
                registerSubmitAlert.show();
            }break;
            case 0x04:{
                showToast("无法检测人脸特征，请重试");
                finish();
            }break;
            case 0x05:{
                showToast("未发现人脸,请重试");
                finish();
            }break;
            case 0x06:{
                hideLoadingDialog();
                if(isNetWork()){
                    showToast("数据提交失败,请重试");
                }else{
                    showToast("数据提交失败,请检查网络");
                }
                finish();
            }break;
            case 0x07:{
                handUploadResult((String) msg.obj);
            }break;
            case 0x08:{
                hideLoadingDialog();
                handSubmitFaceResult((String) msg.obj);
            }break;

        }
    }

    @Override
    public void onCancel() {
        Log.i("xiao_","Activity收到回调");
        this.finish();
    }

    @Override
    public void onConfirm(String fn,String sp,int rid, int bid, int cid) {
        this.faceName = fn;
        this.roomid = rid;
        this.blockid = bid;
        this.communityId = cid;
        this.strPhone = sp;
        if(mAFR_FSDKFace!=null){
            File f = faceDB.saveData(mAFR_FSDKFace,faceName);
            if(f!=null && f.exists()){
                uploadFile(path,f.toString());
            }
        }
    }



    private boolean getPath(Intent intent){
        try{
            path = intent.getStringExtra("file");
            if(path == null || path.length()<=0){
                return false;
            }
            return true;
        }catch (Exception e){
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public void surfaceCreated(SurfaceHolder surfaceHolder) {
        mSurfaceHolder = surfaceHolder;
    }

    @Override
    public void surfaceChanged(SurfaceHolder surfaceHolder, int i, int i1, int i2) {

    }

    @Override
    public void surfaceDestroyed(SurfaceHolder surfaceHolder) {
        mSurfaceHolder = null;
    }


    private void uploadFile(final String imagePath,final String dataPath){
        new Thread(new Runnable() {
            @Override
            public void run() {
                String uploadImageUrl = "";
                File imageFile = new File(imagePath);
                if(imageFile.exists()){
                    String iurl = "http://www.lockaxial.com/app/upload/image";
                    uploadImageUrl = UploadUtil.uploadFile(token,imageFile,iurl);
                    if(uploadImageUrl == null){
                        uploadImageUrl = "";
                    }
                }
                String uploadDataUrl = "";
                File dataFile = new File(dataPath);
                if(dataFile.exists()){
                    String durl = "http://www.lockaxial.com/app/upload/file";
                    uploadDataUrl = UploadUtil.uploadFile(token,dataFile,durl);
                    if(uploadDataUrl == null){
                        uploadDataUrl = "";
                    }
                }else{
                    uploadDataUrl = "";
                }
                showL("data地址："+uploadDataUrl);
                showL("Image地址："+uploadImageUrl);
                if(uploadDataUrl.length()<=0 || uploadImageUrl.length()<=0){
                    mHandler.sendEmptyMessage(0x06);
                }else{
                    try{
                        JSONObject j = new JSONObject();
                        j.put("uploadImageUrl",uploadImageUrl);
                        j.put("uploadDataUrl",uploadDataUrl);
                        Message message = Message.obtain();
                        message.what = 0x07;
                        message.obj = j.toString();
                        mHandler.sendMessage(message);
                    }catch (Exception e){
                        e.printStackTrace();
                    }
                }
            }
        }).start();
    }

    private void handUploadResult(String result){
        try{
            JSONObject j = new JSONObject(result);
            String uploadImageUrl = j.getString("uploadImageUrl");
            String uploadDataUrl = j.getString("uploadDataUrl");
            submitFace(userid,roomid,blockid,uploadImageUrl,uploadDataUrl,faceName,strPhone,communityId);
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    private void submitFace(int uid,int rid,int bid,String iu,String du,String fn,String sp,int cid){
        String url = "http://www.lockaxial.com/app/rfid/appPostFace?userid="+uid;
        url = url+"&roomid="+rid;
        url = url+"&blockid="+bid;
        url = url+"&imageUrl="+iu;
        url = url+"&dataUrl="+du;
        url = url+"&faceName="+fn;
        url = url+"&communityId="+cid;
        url = url+"&phone="+sp;
        asyncHttp(url, token, new AsyncCallBack() {
            @Override
            public void onResult(String result) {
                Message message = Message.obtain();
                message.what = 0x08;
                message.obj = result;
                mHandler.sendMessage(message);
            }
        });
    }

    private void handSubmitFaceResult(String result){
        if(result!=null && result.length()>0){
            try{
                JSONObject j = new JSONObject(result);
                int code = j.has("code")?j.getInt("code"):-1;
                if(code == 0){
                    showToast("提交成功");
                    EventBus.getDefault().post(new RegisterEvent("Exit"));
                }else if(code == 1){
                    showToast("提交失败，您没有权限");
                }else if(code == 2){
                    showToast("提交失败，未找到指定门禁设备");
                }else if(code == 3){
                    showToast("提交失败，请联系管理员");
                }else if(code == 4){
                    showToast("提交失败，姓名重复");
                }
            }catch (Exception e){
                e.printStackTrace();
            }
        }else{
            showToast("提交失败，请检查网络");
        }
        this.finish();
    }
    class faceThread extends Thread{
        @Override
        public void run() {
            while (mSurfaceHolder == null) {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            byte[] data = new byte[mBitmap.getWidth() * mBitmap.getHeight() * 3 / 2];
            ImageConverter convert = new ImageConverter();
            convert.initial(mBitmap.getWidth(), mBitmap.getHeight(), ImageConverter.CP_PAF_NV21);
            if (convert.convert(mBitmap, data)) {
                Log.d(TAG, "convert ok!");
            }
            convert.destroy();
            AFD_FSDKEngine engine = new AFD_FSDKEngine();
            AFD_FSDKVersion version = new AFD_FSDKVersion();
            List<AFD_FSDKFace> result = new ArrayList<AFD_FSDKFace>();
            AFD_FSDKError err = engine.AFD_FSDK_InitialFaceEngine(FaceDB.appid, FaceDB.fd_key, AFD_FSDKEngine.AFD_OPF_0_HIGHER_EXT, 16, 5);
            Log.d(TAG, "AFD_FSDK_InitialFaceEngine = " + err.getCode());
            if (err.getCode() != AFD_FSDKError.MOK) {
                mHandler.sendEmptyMessage(0x01); // FD初始化失败
            }
            err = engine.AFD_FSDK_GetVersion(version);
            Log.d(TAG, "AFD_FSDK_GetVersion =" + version.toString() + ", " + err.getCode());
            err  = engine.AFD_FSDK_StillImageFaceDetection(data, mBitmap.getWidth(), mBitmap.getHeight(), AFD_FSDKEngine.CP_PAF_NV21, result);
            Log.d(TAG, "AFD_FSDK_StillImageFaceDetection =" + err.getCode() + "<" + result.size());
            while (mSurfaceHolder != null) {
                Canvas canvas = mSurfaceHolder.lockCanvas();
                if (canvas != null) {
                    Paint mPaint = new Paint();
                    boolean fit_horizontal = canvas.getWidth() / (float)src.width() < canvas.getHeight() / (float)src.height() ? true : false;
                    float scale = 1.0f;
                    if (fit_horizontal) {
                        scale = canvas.getWidth() / (float)src.width();
                        dst.left = 0;
                        dst.top = (canvas.getHeight() - (int)(src.height() * scale)) / 2;
                        dst.right = dst.left + canvas.getWidth();
                        dst.bottom = dst.top + (int)(src.height() * scale);
                    } else {
                        scale = canvas.getHeight() / (float)src.height();
                        dst.left = (canvas.getWidth() - (int)(src.width() * scale)) / 2;
                        dst.top = 0;
                        dst.right = dst.left + (int)(src.width() * scale);
                        dst.bottom = dst.top + canvas.getHeight();
                    }
                    canvas.drawBitmap(mBitmap, src, dst, mPaint);
                    canvas.save();
                    canvas.scale((float) dst.width() / (float) src.width(), (float) dst.height() / (float) src.height());
                    canvas.translate(dst.left / scale, dst.top / scale);
                    for (AFD_FSDKFace face : result) {
                        mPaint.setColor(Color.RED);
                        mPaint.setStrokeWidth(10.0f);
                        mPaint.setStyle(Paint.Style.STROKE);
                        canvas.drawRect(face.getRect(), mPaint);
                    }
                    canvas.restore();
                    mSurfaceHolder.unlockCanvasAndPost(canvas);
                    break;
                }
            }

            if (!result.isEmpty()) {
                AFR_FSDKVersion version1 = new AFR_FSDKVersion();
                AFR_FSDKEngine engine1 = new AFR_FSDKEngine();
                AFR_FSDKFace result1 = new AFR_FSDKFace();
                AFR_FSDKError error1 = engine1.AFR_FSDK_InitialEngine(FaceDB.appid, FaceDB.fr_key);
                Log.d("com.arcsoft", "AFR_FSDK_InitialEngine = " + error1.getCode());
                if (error1.getCode() != AFD_FSDKError.MOK) {
                    mHandler.sendEmptyMessage(0x02);
                }
                error1 = engine1.AFR_FSDK_GetVersion(version1);
                Log.d("com.arcsoft", "FR=" + version.toString() + "," + error1.getCode()); //(210, 178 - 478, 446), degree = 1　780, 2208 - 1942, 3370
                error1 = engine1.AFR_FSDK_ExtractFRFeature(data, mBitmap.getWidth(), mBitmap.getHeight(), AFR_FSDKEngine.CP_PAF_NV21, new Rect(result.get(0).getRect()), result.get(0).getDegree(), result1);
                Log.d("com.arcsoft", "Face=" + result1.getFeatureData()[0] + "," + result1.getFeatureData()[1] + "," + result1.getFeatureData()[2] + "," + error1.getCode());
                if(error1.getCode() == error1.MOK) {
                    mAFR_FSDKFace = result1.clone();
                    int width = result.get(0).getRect().width();
                    int height = result.get(0).getRect().height();
                    Bitmap face_bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
                    Canvas face_canvas = new Canvas(face_bitmap);
                    face_canvas.drawBitmap(mBitmap, result.get(0).getRect(), new Rect(0, 0, width, height), null);
                    mHandler.sendEmptyMessage(0x03);
                }else{
                    mHandler.sendEmptyMessage(0x04);
                }
                error1 = engine1.AFR_FSDK_UninitialEngine();
                Log.d("com.arcsoft", "AFR_FSDK_UninitialEngine : " + error1.getCode());


            }else {
                mHandler.sendEmptyMessage(0x05);
            }
            err = engine.AFD_FSDK_UninitialFaceEngine();
            Log.d(TAG, "AFD_FSDK_UninitialFaceEngine =" + err.getCode());
        }
    }
}
