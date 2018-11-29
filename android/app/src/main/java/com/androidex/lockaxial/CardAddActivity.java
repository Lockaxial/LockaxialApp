package com.androidex.lockaxial;
import android.app.AlertDialog;
import android.app.PendingIntent;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.NfcA;
import android.os.Message;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.androidex.R;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Created by Administrator on 2018/5/17.
 */

public class CardAddActivity extends BaseActivity {
    private TextView title;
    private NfcAdapter mNfcAdapter;
    private PendingIntent pi;
    private EditText name;
    private EditText number;
    private TextView room;
    private String roomData;
    private String currentUnit;
    private String token;
    private String[] roomArray;
    private JSONArray roomJsonArray;

    private int userid;
    private int lockid;
    private int roomid;
    private String cardnumber;
    private String cardname;
    private int communityId;
    private String unitNo;
    private int blockid;

    private String url;


    private String[][] techListsArray = new String[][]{new String[]{NfcA.class.getName()}};
    private IntentFilter[] intentFiltersArray = null;

    public void onSubmit(View v){
        String strName = name.getText().toString().trim();
        String strNumber = number.getText().toString().trim();
        if(strName == null || strName.length()<=0){
            Toast.makeText(this,"请输入持卡人姓名",Toast.LENGTH_SHORT).show();
            return;
        }
        if(strNumber == null || strNumber.length()<=0){
            Toast.makeText(this,"请刷入门禁卡",Toast.LENGTH_SHORT).show();
            return;
        }
        cardnumber = strNumber;
        cardname = strName;
        postCard();
    }

    private void postCard(){
        showLoading("正在提交...");
        url = "http://www.lockaxial.com/app/rfid/appPostCard?userid="+this.userid;
        url = url +"&roomid="+this.roomid;
        url = url +"&cardnumber="+this.cardnumber;
        url = url +"&cardname="+this.cardname;
        url = url +"&communityId="+this.communityId;
        url = url +"&unitNo="+this.unitNo;
        url = url +"&blockid="+this.blockid;
        Log.i("xiao_","录卡地址："+url);
        asyncHttp(url, token, new AsyncCallBack() {
            @Override
            public void onResult(String result) {
                Message message = new Message();
                message.what = 0x01;
                message.obj = result;
                mHandler.sendMessage(message);
            }
        });
    }

    @Override
    public void initParms(Intent intent) {
        roomData = intent.getStringExtra("data");
        if(roomData!=null && roomData.length()>0){
            try{
                roomJsonArray = new JSONArray(roomData);
                roomArray = new String[roomJsonArray.length()];
                for(int i=0;i<roomJsonArray.length();i++){
                    roomArray[i] = roomJsonArray.getJSONObject(i).getString("unitName");
                }
            }catch (Exception e){
                e.printStackTrace();
            }
        }
        currentUnit = intent.getStringExtra("currentUnit");
        userid = intent.getIntExtra("userid",-1);
        if(userid <= 0){
            Toast.makeText(this,"请先登录...",Toast.LENGTH_SHORT).show();
            this.finish();
        }
        token = intent.getStringExtra("token");
    }

    @Override
    public int bindView() {
        return R.layout.activity_cardadd;
    }

    @Override
    public void initView(View v) {
        title = (TextView) findViewById(R.id.title);
        title.setText("录卡");
        name = (EditText) findViewById(R.id.name);
        number = (EditText) findViewById(R.id.number);
        room = (TextView) findViewById(R.id.room);
        room.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if(roomJsonArray!=null && roomArray!=null && roomArray.length>0){
                    buildAlert(roomArray, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
                            room.setText(roomArray[i]);
                            try {
                                roomid = roomJsonArray.getJSONObject(i).getInt("rid");
                                lockid = roomJsonArray.getJSONObject(i).getInt("blockId");
                                communityId = roomJsonArray.getJSONObject(i).getInt("communityId");
                                unitNo = roomJsonArray.getJSONObject(i).getString("unitNo");
                                blockid = roomJsonArray.getJSONObject(i).getInt("blockId");
                            }catch (Exception e){
                                e.printStackTrace();
                            }
                        }
                    });
                }
            }
        });
        initData();
    }

    @Override
    public void onMessage(Message msg) {
        switch (msg.what){
            case 0x01:
                hideLoadingDialog();
                handerResult((String) msg.obj);
                break;
        }
    }

    private void initData(){
        if(currentUnit!=null){
            try{
                JSONObject j = new JSONObject(currentUnit);
                room.setText(j.getString("unitName"));
                roomid = j.getInt("rid");
                lockid = j.getInt("blockId");
                communityId = j.getInt("communityId");
                unitNo = j.getString("unitNo");
                blockid = j.getInt("blockId");
            }catch (Exception e){
                e.printStackTrace();
            }
        }
        mNfcAdapter = NfcAdapter.getDefaultAdapter(this);
        checkNFC();
        if(intentFiltersArray == null){
            IntentFilter ndef = new IntentFilter(NfcAdapter.ACTION_NDEF_DISCOVERED);
            try {
                ndef.addDataType("*/*");
            } catch (IntentFilter.MalformedMimeTypeException e) {
                throw new RuntimeException("fail", e);
            }
            intentFiltersArray = new IntentFilter[]{ndef};
        }

        pi = PendingIntent.getActivity(this, 0, new Intent(this, getClass())
                .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), 0);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if(mNfcAdapter != null){
            mNfcAdapter.enableForegroundDispatch(this, pi, intentFiltersArray, techListsArray);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if(mNfcAdapter != null){
            mNfcAdapter.disableForegroundDispatch(this);
        }
    }

    private void checkNFC(){
        if(mNfcAdapter!=null){
            if (!mNfcAdapter.isEnabled()) {
                showOpenNfcDialg();
            }
        }else{
            showToast("您手机不支持NFC功能,请手动输入门禁卡号");
        }
    }

    private void showOpenNfcDialg(){
        AlertDialog dialog = new AlertDialog.Builder(this)
                .setTitle("打开NFC")//设置对话框的标题
                .setMessage("检测到手机未打开NFC功能，是否前往打开")//设置对话框的内容
                //设置对话框的按钮
                .setNegativeButton("取消", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.dismiss();
                    }
                })
                .setPositiveButton("确定", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        Intent setNfc = new Intent(Settings.ACTION_NFC_SETTINGS);
                        CardAddActivity.this.startActivity(setNfc);
                        dialog.dismiss();
                    }
                }).create();
        dialog.show();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        if (NfcAdapter.ACTION_TAG_DISCOVERED.equals(intent.getAction())) {
            String cardid = processIntent(intent);
            if(cardid!=null && cardid.length()>0){
                number.setText(cardid);
                Log.i("xiao_","卡号："+cardid);
            }
        }
    }

    private void handerResult(String result){
        if(result!=null && result.length()>0){
            try{
                JSONObject j = new JSONObject(result);
                int code = j.has("code")?j.getInt("code"):-1;
                String msg = "";
                if(code == 0){
                    msg = "录卡成功";
                }else if(code == 1){
                    msg = "楼栋号不存在";
                }else if(code == 2){
                    msg = "未找到指定单元";
                }else if(code == 3){
                    msg = "卡重复录入";
                }else if(code == 4){
                    msg = "录卡失败，请联系管理员";
                }else if(code == 5){
                    msg = "录卡失败，请联系管理员";
                }else if(code == 6){
                    msg = "您不是业主，不能使用录卡功能";
                }else{
                    if(!isNetWork()){
                        msg = "请检查网络";
                    }
                }
                showToast(msg);
                if(code == 0){
                    CardAddActivity.this.finish();
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

    private String processIntent(Intent intent) {
        String CardId = "";
        try {
            Tag tagFromIntent = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
            CardId = ByteArrayToHexString(tagFromIntent.getId());
        }catch (Exception e){
            e.printStackTrace();
        }
        return CardId;
    }

    private String ByteArrayToHexString(byte[] inarray) {
        int i, j, in;
        String[] hex = { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A",
                "B", "C", "D", "E", "F" };
        String out = "";
        for (j = 0; j < inarray.length; ++j) {
            in = (int) inarray[j] & 0xff;
            i = (in >> 4) & 0x0f;
            out += hex[i];
            i = in & 0x0f;
            out += hex[i];
        }
        return out;
    }

    public void onBackEvent(View v){
        this.finish();
    }

}
