package com.androidex.lockaxial.util;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.androidex.R;
import com.reactnativenavigation.events.EventBus;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Created by Administrator on 2018/5/31.
 */

public class RegisterSubmitAlert extends Dialog {
    private TextView title;
    private EditText name;
    private EditText phone;
    private Button cancel;
    private Button confirm;
    private Context context;
    private TextView houseName;

    private String houseData;
    private String currentUnit;

    private int roomid;
    private int blockId;
    private int communityId;
    private String[] roomArray;
    private JSONArray roomJsonArray;
    private OnSibmitCallBack callBack;

    public RegisterSubmitAlert(@NonNull Context context) {
        super(context);
        this.context = context;
    }

    public RegisterSubmitAlert(@NonNull Context context, int themeResId,String houseData,String currentUnit,OnSibmitCallBack cb) {
        super(context, themeResId);
        this.context = context;
        this.houseData = houseData;
        this.currentUnit = currentUnit;
        this.callBack = cb;
    }

    protected RegisterSubmitAlert(@NonNull Context context, boolean cancelable, @Nullable OnCancelListener cancelListener) {
        super(context, cancelable, cancelListener);
        this.context = context;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setCanceledOnTouchOutside(false);
        setContentView(R.layout.dialog_submit);
        setCancelable(false);
        title = (TextView) findViewById(R.id.title);
        title.setText("人脸信息");
        houseName = (TextView) findViewById(R.id.house_name);
        houseName.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                onSelectHouse();
            }
        });
        if(currentUnit!=null && currentUnit.length()>0){
            try{
                JSONObject j = new JSONObject(currentUnit);
                houseName.setText(j.getString("unitName"));
                roomid = j.getInt("rid");
                blockId = j.getInt("blockId");
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

        name = (EditText) findViewById(R.id.name);
        phone = (EditText) findViewById(R.id.phone);
        cancel = (Button) findViewById(R.id.cancel);
        confirm = (Button) findViewById(R.id.confirm);
        cancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Log.i("xiao_","点击取消");
                if(callBack!=null){
                    Log.i("xiao_","callBack！=null ,执行回调");
                    callBack.onCancel();
                }
                Log.i("xiao_","结束Dialog");
                RegisterSubmitAlert.this.dismiss();
            }
        });

        confirm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String strName = name.getText().toString().trim();
                String strPhone = phone.getText().toString().trim();
                if(strName == null || strName.length() <= 0){
                    Toast.makeText(context,"请输入姓名",Toast.LENGTH_SHORT).show();
                    return;
                }

                if(strPhone == null || strPhone.length() != 11){
                    Toast.makeText(context,"请输入正确的电话号码",Toast.LENGTH_SHORT).show();
                    return;
                }
                if(callBack!=null){
                    callBack.onConfirm(strName,strPhone,roomid,blockId,communityId);
                }
                RegisterSubmitAlert.this.dismiss();
            }
        });
    }

    public void onSelectHouse(){
        if(roomArray!=null && roomArray.length>0){
            buildAlert(roomArray).show();
        }
    }

    private AlertDialog buildAlert(String[] data){
        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.setItems(data, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                try {
                    houseName.setText(roomJsonArray.getJSONObject(i).getString("unitName"));
                    roomid = roomJsonArray.getJSONObject(i).getInt("rid");
                    blockId = roomJsonArray.getJSONObject(i).getInt("blockId");
                    communityId = roomJsonArray.getJSONObject(i).getInt("communityId");
                }catch (Exception e){
                    e.printStackTrace();
                }
            }
        });
        return builder.create();
    }

    public interface OnSibmitCallBack{
        public void onCancel();
        public void onConfirm(String faceName,String strPhone,int roomid,int blockId,int communityId);
    }
}
