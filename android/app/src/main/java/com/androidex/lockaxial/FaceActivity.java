package com.androidex.lockaxial;

import android.content.DialogInterface;
import android.content.Intent;
import android.os.Message;
import android.view.View;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.androidex.R;
import com.androidex.lockaxial.bean.FaceBean;
import com.androidex.lockaxial.util.HttpApi;
import com.bumptech.glide.Glide;
import com.mcxtzhang.commonadapter.lvgv.CommonAdapter;
import com.mcxtzhang.commonadapter.lvgv.ViewHolder;
import com.mcxtzhang.swipemenulib.SwipeMenuLayout;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by Administrator on 2018/5/15.
 */

public class FaceActivity extends BaseActivity {
    private ListView mlv;
    private TextView title;
    private TextView house_name;
    private TextView error;

    private String houseData;
    private String currentUnit;

    private String[] roomArray;
    private JSONArray roomJsonArray;

    private int roomid = -1;
    private int userid;
    private String token;

    private void showData(List<FaceBean> data){
        if(data!=null && data.size()>0){
            mlv.setVisibility(View.VISIBLE);
            error.setVisibility(View.GONE);
            mlv.setAdapter(new CommonAdapter<FaceBean>(FaceActivity.this,data,R.layout.activity_face_item) {
                @Override
                public void convert(final ViewHolder viewHolder, final FaceBean faceBean, int i) {
                    viewHolder.setText(R.id.name, faceBean.faceName);
                    viewHolder.setText(R.id.createDate, UTCStringtODefaultString(faceBean.createDate));
                    ImageView imageView = viewHolder.getView(R.id.image);
                    String loadUrl = "http://www.lockaxial.com/"+faceBean.imageUrl;
                    showL("姓名："+faceBean.faceName+",地址："+loadUrl);
                    Glide.with(FaceActivity.this)
                            .load(loadUrl)
                            .placeholder(R.drawable.ic_def_bg)
                            .dontAnimate()
                            .error(R.drawable.ic_def_bg)
                            .into(imageView);
                    viewHolder.setOnClickListener(R.id.btnDelete, new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            ((SwipeMenuLayout) viewHolder.getConvertView()).quickClose();
                            deleteFace(userid,faceBean.id,roomid);
                        }
                    });
                }
            });
        }else{
            mlv.setVisibility(View.GONE);
            error.setVisibility(View.VISIBLE);
        }
    }


    @Override
    public void initParms(Intent intent) {
        houseData = intent.getStringExtra("data");
        currentUnit = intent.getStringExtra("currentUnit");
        userid = intent.getIntExtra("userid",-1);
        token = intent.getStringExtra("token");
    }

    private void initData(){
        if(currentUnit!=null && currentUnit.length()>0){
            try{
                JSONObject j = new JSONObject(currentUnit);
                house_name.setText(j.getString("unitName"));
                roomid = j.getInt("rid");
            }catch (Exception e){
                e.printStackTrace();
            }
        }
        if(houseData!=null && houseData.length()>0){
            try{
                roomJsonArray = new JSONArray(houseData);
                roomArray = new String[roomJsonArray.length()];
                for(int i=0;i<roomJsonArray.length();i++){
                    roomArray[i] = roomJsonArray.getJSONObject(i).getString("unitName");
                }
            }catch (Exception e){
                e.printStackTrace();
            }
        }
    }

    @Override
    public int bindView() {
        return R.layout.activity_face;
    }

    @Override
    public void initView(View v) {
        mlv = (ListView) findViewById(R.id.mlv);
        title = (TextView) findViewById(R.id.title);
        title.setText("人脸识别");
        house_name = (TextView) findViewById(R.id.house_name);
        error = (TextView) findViewById(R.id.error);
        initData();
    }

    @Override
    public void onMessage(Message msg) {
        switch (msg.what){
            case 0x01:{
                showL("收到0x01");
                hideLoadingDialog();
                showData(handGetCardResult((String) msg.obj));
            }break;
            case 0x02:{
                hideLoadingDialog();
                handDeleteFaceResult((String) msg.obj);
            }break;
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        getFaceList();
    }

    public void selectHouse(View v){
        if(roomArray!=null && roomArray.length>0){
            buildAlert(roomArray, new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialogInterface, int i) {
                    try {
                        currentUnit = roomJsonArray.getJSONObject(i).toString();
                        house_name.setText(roomJsonArray.getJSONObject(i).getString("unitName"));
                        roomid = roomJsonArray.getJSONObject(i).getInt("rid");
                        getFaceList();
                    }catch (Exception e){
                        e.printStackTrace();
                    }
                }
            });
        }
    }

    public void onBackEvent(View v){
        this.finish();
    }

    public void onAddEvent(View v){
        Intent in = new Intent(this,FaceAddActivity.class);
        in.putExtra("data",houseData);
        in.putExtra("currentUnit",currentUnit);
        in.putExtra("userid",userid);
        in.putExtra("token",token);
        startActivity(in);
    }

    private void getFaceList(){
        showL("正在获取数据....");
        showLoading("正在获取数据...");
        String url = "http://www.lockaxial.com/app/rfid/getFaceDataByRoomid?roomid="+roomid;
        asyncHttp(url, token, new AsyncCallBack() {
            @Override
            public void onResult(String result) {
                Message message = Message.obtain();
                message.what = 0x01;
                message.obj = result;
                mHandler.sendMessage(message);
            }
        });
    }

    private List<FaceBean> handGetCardResult(String result){
        if(result!=null && result.length()>0){
            try{
                JSONObject j = new JSONObject(result);
                int code = j.has("code")?j.getInt("code"):-1;
                if(code == 0){
                    JSONArray array = j.has("data")?j.getJSONArray("data"):null;
                    if(array!=null && array.length()>0){
                        List<FaceBean> data = new ArrayList<>();
                        for(int i=0;i<array.length();i++){
                            int id = array.getJSONObject(i).getInt("id");
                            String imageUrl = array.getJSONObject(i).getString("imageUrl");
                            String dataUrl = array.getJSONObject(i).getString("dataUrl");
                            String faceName = array.getJSONObject(i).getString("faceName");
                            String createDate = array.getJSONObject(i).getString("creDate");
                            data.add(new FaceBean(id,imageUrl,dataUrl,faceName,createDate));
                        }
                        return data;
                    }
                }
            }catch (Exception e){
                e.printStackTrace();
                showToast("数据获取失败，请联系管理员");
            }
        }
        else{
            if(isNetWork()){
                showToast("请求超时，数据获取失败");
            }else{
                showToast("请检查网络");
            }
        }
        return null;
    }

    private void deleteFace(int uid,int fid,int rid){
        showLoading("正在删除数据...");
        String url = "http://www.lockaxial.com/app/rfid/deleteFaceData?userid="+uid;
        url = url+"&roomid="+rid;
        url = url+"&faceid="+fid;
        asyncHttp(url, token, new AsyncCallBack() {
            @Override
            public void onResult(String result) {
                Message message = Message.obtain();
                message.what = 0x02;
                message.obj = result;
                mHandler.sendMessage(message);
            }
        });
    }

    private void handDeleteFaceResult(String result){
        if(result!=null && result.length()>0){
            try{
                JSONObject j = new JSONObject(result);
                int code = j.has("code")?j.getInt("code"):-1;
                if(code == 0){
                    showToast("操作成功");
                }else if(code == 1){
                    showToast("操作失败，您不是业主");
                }else if(code == 2){
                    showToast("操作失败，请联系管理员");
                }else if(code == 3){
                    showToast("操作失败，请联系管理员");
                }else{
                    showToast("操作失败");
                }
            }catch (Exception e){
                showToast("操作失败，请联系管理员");
                e.printStackTrace();
            }
            getFaceList();
        }else{
            if(isNetWork()){
                showToast("请求超时，操作失败");
            }else{
                showToast("请检查网络");
            }
        }
    }
}
