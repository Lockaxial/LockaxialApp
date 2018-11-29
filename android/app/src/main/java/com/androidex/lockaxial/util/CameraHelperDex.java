package com.androidex.lockaxial.util;

import android.app.Activity;
import android.graphics.ImageFormat;
import android.util.Log;
import android.view.Surface;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.hardware.Camera;
import android.widget.Toast;

import java.util.List;

/**
 * Created by Administrator on 2018/6/13.
 */

public class CameraHelperDex implements Camera.PreviewCallback{
    private Activity mActivity;
    private SurfaceView mSurfaceView;
    private Camera mCamera;
    private Camera.Parameters mParameters;
    private SurfaceHolder mSurfaceHolder;
    private int mCameraFacing = Camera.CameraInfo.CAMERA_FACING_FRONT;
    private int mDisplayOrientation = 0;
    private int picWidth = 2160;
    private int picHeight = 3840;
    private CallBack mCallBack;
    public CameraHelperDex(Activity activity,SurfaceView surfaceView){
        this.mActivity = activity;
        this.mSurfaceView = surfaceView;
        this.mSurfaceHolder = mSurfaceView.getHolder();
        init();
    }

    @Override
    public void onPreviewFrame(byte[] bytes, Camera camera) {
        this.mCallBack.onPreviewFrame(bytes);
    }

    public void takePic(){
        if(mCamera!=null){
            mCamera.takePicture(null, null, new Camera.PictureCallback() {
                @Override
                public void onPictureTaken(byte[] bytes, Camera camera) {
                    mCallBack.onTakePic(bytes);
                }
            });
        }
    }

    public int getCameradirection(){
        return mCameraFacing;
    }

    private void init(){
        mSurfaceHolder.addCallback(new SurfaceHolder.Callback() {
            @Override
            public void surfaceCreated(SurfaceHolder surfaceHolder) {
                if (mCamera == null) {
                    openCamera(mCameraFacing);
                }
                startPreview();
            }

            @Override
            public void surfaceChanged(SurfaceHolder surfaceHolder, int i, int i1, int i2) {

            }

            @Override
            public void surfaceDestroyed(SurfaceHolder surfaceHolder) {
                releaseCamera();
            }
        });
    }

    private boolean openCamera(int cameraFacing){
        boolean supportCameraFacing = supportCameraFacing(cameraFacing);
        if(supportCameraFacing){
            try{
                mCamera = Camera.open(cameraFacing);
                initParameters(mCamera);
                mCamera.setPreviewCallback(this);
            }catch (Exception e){
                e.printStackTrace();
                toast("打开相机失败!");
                return false;
            }
        }
        return supportCameraFacing;
    }

    private void initParameters(Camera camera){
        mParameters = camera.getParameters();
        mParameters.setPreviewFormat(ImageFormat.NV21);
        Camera.Size privSize = getBestSize(mSurfaceView.getWidth(),mSurfaceView.getHeight(),mParameters.getSupportedPreviewSizes());
        mParameters.setPreviewSize(privSize.width, privSize.height);
        Camera.Size picSize = getBestSize(picWidth, picHeight, mParameters.getSupportedPictureSizes());
        mParameters.setPictureSize(picSize.width, picSize.height);
        if(isSupportFocus(Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE)){
            mParameters.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE);
        }else{
            log("不支持自动连续对焦");
        }
        camera.setParameters(mParameters);
    }

    private void startPreview(){
        if(mCamera!=null){
            try {
                mCamera.setPreviewDisplay(mSurfaceHolder);
                setCameraDisplayOrientation(mActivity);
                mCamera.startPreview();
            }catch (Exception e){
                e.printStackTrace();
            }
        }
    }


    private boolean isSupportFocus(String focusMode){
        boolean autoFocus = false;
        List<String> listFocusMode = mParameters.getSupportedFocusModes();
        for(String mode : listFocusMode){
            log("对焦模式："+mode);
            if(mode.equals(focusMode)){
                autoFocus = true;
            }
        }
        return autoFocus;
    }

    public void exchangeCamera(){
        releaseCamera();
        mCameraFacing = mCameraFacing == Camera.CameraInfo.CAMERA_FACING_BACK?Camera.CameraInfo.CAMERA_FACING_FRONT:Camera.CameraInfo.CAMERA_FACING_BACK;
        openCamera(mCameraFacing);
        startPreview();
    }

    private void releaseCamera(){
        if(mCamera!=null){
            mCamera.stopPreview();
            mCamera.setPreviewCallback(null);
            mCamera.release();
            mCamera = null;
        }
    }

    private Camera.Size getBestSize(int width,int height,List<Camera.Size> list){
        Camera.Size size = null;
        double targetRatio = height*1.0/width*1.0;
        double minDiff = targetRatio;

        for (Camera.Size cSize : list) {
            double supportedRatio = ((cSize.width*1.0) / cSize.height);
            log("系统支持的尺寸 : "+cSize.width +" * "+cSize.height+"比例"+supportedRatio);
        }

        for(Camera.Size cSize : list){
            if(cSize.width == width && cSize.height == height){
                size = cSize;
                break;
            }
            double ratio = (cSize.width*1.0)/cSize.height;
            if(Math.abs(ratio - targetRatio) < minDiff){
                minDiff = Math.abs(ratio - targetRatio);
                size = cSize;
            }
        }
        log("目标尺寸 ："+width+" * "+height+"   比例:"+targetRatio);
        log("最优尺寸 ："+size.width+" * "+size.height);
        return size;
    }

    private void setCameraDisplayOrientation(Activity activity){
        Camera.CameraInfo info = new Camera.CameraInfo();
        Camera.getCameraInfo(mCameraFacing, info);
        int rotation = activity.getWindowManager().getDefaultDisplay().getRotation();
        int screenDegree = 0;
        switch (rotation){
            case Surface.ROTATION_0:{
                screenDegree = 0;
            }break;
            case Surface.ROTATION_90:{
                screenDegree = 90;
            }break;
            case Surface.ROTATION_180:{
                screenDegree = 180;
            }break;
            case Surface.ROTATION_270:{
                screenDegree = 270;
            }break;
        }
        if(info.facing == Camera.CameraInfo.CAMERA_FACING_FRONT){
            mDisplayOrientation = (info.orientation + screenDegree) % 360;
            mDisplayOrientation = (360 - mDisplayOrientation) % 360;
        }else{
            mDisplayOrientation = (info.orientation - screenDegree + 360) % 360;
        }
        mCamera.setDisplayOrientation(mDisplayOrientation);
    }

    private boolean supportCameraFacing(int cameraFacing){
        Camera.CameraInfo info = new Camera.CameraInfo();
        int n = Camera.getNumberOfCameras();
        for(int i=0;i<n;i++){
            Camera.getCameraInfo(i, info);
            if(info.facing == cameraFacing){
                return true;
            }
        }
        return false;
    }

    private void toast(String msg) {
        Toast.makeText(mActivity, msg, Toast.LENGTH_SHORT).show();
    }

    private void log(String msg){
        Log.i("xiao_",msg);
    }

    public Camera getCamera(){
        return mCamera;
    }

    public void  addCallBack(CallBack callBack) {
        this.mCallBack = callBack;
    }

    public interface CallBack{
        public void onPreviewFrame(byte[] bytes);
        public void onTakePic(byte[] bytes);
    }
}
