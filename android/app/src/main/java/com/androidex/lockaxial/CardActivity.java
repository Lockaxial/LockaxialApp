package com.androidex.lockaxial;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.androidex.lockaxial.bean.CardBean;
import com.androidex.lockaxial.util.HttpApi;
import com.mcxtzhang.commonadapter.lvgv.CommonAdapter;

import com.androidex.R;
import com.mcxtzhang.commonadapter.lvgv.ViewHolder;
import com.mcxtzhang.swipemenulib.SwipeMenuLayout;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Response;

/**
 * Created by Administrator on 2018/5/15.
 */

public class CardActivity  extends BaseActivity{
    private ListView mlv;
    private TextView title;
    private TextView house_name;
    private TextView error;

    private String houseData;
    private String currentUnit;
    private int userid;
    private String token;

    private String[] roomArray;
    private JSONArray roomJsonArray;

    private int roomid = -1;
    private int communityId = -1;

    @Override
    public void initParms(Intent intent) {
        houseData = intent.getStringExtra("data");
        currentUnit = intent.getStringExtra("currentUnit");
        userid = intent.getIntExtra("userid",-1);
        token = intent.getStringExtra("token");
    }

    @Override
    public int bindView() {
        return R.layout.activity_card;
    }

    @Override
    public void initView(View v) {
        mlv = (ListView) findViewById(R.id.mlv);
        title = (TextView) findViewById(R.id.title);
        title.setText("门禁卡");
        house_name = (TextView) findViewById(R.id.house_name);
        error = (TextView) findViewById(R.id.error);
        if(currentUnit!=null && currentUnit.length()>0){
            try{
                JSONObject j = new JSONObject(currentUnit);
                house_name.setText(j.getString("unitName"));
                roomid = j.getInt("rid");
                communityId = j.getInt("communityId");
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
    public void onMessage(Message msg) {
        switch (msg.what){
            case 0x01:{
                hideLoadingDialog();
                showData(handGetCardResult((String) msg.obj));
            }break;
            case 0x02:{
                hideLoadingDialog();
                handDeleteResult((String) msg.obj);
            }break;
        }
    }

    private void getCardList(){
        showLoading("正在获取数据....");
        String url = "http://www.lockaxial.com/app/rfid/getCardAccess?roomid="+roomid;
        asyncHttp(url,token,new AsyncCallBack(){
            @Override
            public void onResult(String result) {
                Message message = Message.obtain();
                message.what = 0x01;
                message.obj = result;
                mHandler.sendMessage(message);
            }
        });
    }

    private void deleteCard(int uid,int rid,String cardno,int cid){
        showLoading("正在删除数据....");
        String url = "http://www.lockaxial.com/app/rfid/deleteCardAccess?communityId="+cid;
        url = url+"&cardnumber="+cardno;
        url = url+"&userid="+uid;
        url = url+"&roomid="+rid;
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

    private void handDeleteResult(String result){
        if(result!=null &&result.length()>0){
            try{
                JSONObject j = new JSONObject(result);
                int code = j.has("code")?j.getInt("code"):-1;
                if(code == 0){
                    showToast("操作成功");
                    getCardList();
                }else if(code == 1){
                    showToast("操作失败，您不是业主");
                }else if(code == 2){
                    showToast("操作失败，请联系管理员");
                }else if(code == 3){
                    showToast("操作失败，请联系管理员");
                }else{
                    if(!isNetWork()){
                        showToast("请检查网络");
                    }
                }
            }catch (Exception e){
                e.printStackTrace();
            }
        }else{
            if(isNetWork()){
                showToast("请求超时，操作失败");
            }else{
                showToast("请检查网络");
            }
        }
    }

    private List<CardBean> handGetCardResult(String result){
        if(result!=null && result.length()>0){
            try{
                JSONObject j = new JSONObject(result);
                int code = j.has("code")?j.getInt("code"):-1;
                if(code == 0){
                    JSONArray array = j.has("data")?j.getJSONArray("data"):null;
                    if(array!=null && array.length()>0){
                        List<CardBean> data = new ArrayList<>();
                        for(int i=0;i<array.length();i++){
                            String cardName = array.getJSONObject(i).getString("cardname");
                            String cardNumber = array.getJSONObject(i).getString("cardnumber");
                            String createDate = array.getJSONObject(i).getString("credate");
                            data.add(new CardBean(cardName, cardNumber, createDate));
                        }
                        return data;
                    }
                }
            }catch (Exception e){
                e.printStackTrace();
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

    @Override
    protected void onStart() {
        super.onStart();
        getCardList();
    }

    private void showData(List<CardBean> data){
        if(data!=null && data.size()>0){
            mlv.setVisibility(View.VISIBLE);
            error.setVisibility(View.GONE);
            mlv.setAdapter(new CommonAdapter<CardBean>(CardActivity.this,data,R.layout.activity_card_item) {
                @Override
                public void convert(final ViewHolder viewHolder, final CardBean cardBean, int i) {
                    viewHolder.setText(R.id.name, cardBean.cardName);
                    viewHolder.setText(R.id.number, cardBean.cardNumber);
                    viewHolder.setText(R.id.createDate, HttpApi.UTCStringtODefaultString(cardBean.createDate));
                    viewHolder.setOnClickListener(R.id.btnDelete, new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            ((SwipeMenuLayout) viewHolder.getConvertView()).quickClose();
                            deleteCard(userid,roomid,cardBean.cardNumber,communityId);
                        }
                    });
                }
            });
        }else{
            mlv.setVisibility(View.GONE);
            error.setVisibility(View.VISIBLE);
        }
    }

    public void selectHouse(View v){
        if(roomArray!=null && roomArray.length>0){
            buildAlert(roomArray,new DialogInterface.OnClickListener(){
                @Override
                public void onClick(DialogInterface dialogInterface, int i) {
                    try {
                        currentUnit = roomJsonArray.getJSONObject(i).toString();
                        house_name.setText(roomJsonArray.getJSONObject(i).getString("unitName"));
                        roomid = roomJsonArray.getJSONObject(i).getInt("rid");
                        communityId = roomJsonArray.getJSONObject(i).getInt("communityId");
                        getCardList();
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
        Intent in = new Intent(this,CardAddActivity.class);
        in.putExtra("data",houseData);
        in.putExtra("currentUnit",currentUnit);
        in.putExtra("userid",userid);
        in.putExtra("token",token);
        startActivity(in);
    }
}
