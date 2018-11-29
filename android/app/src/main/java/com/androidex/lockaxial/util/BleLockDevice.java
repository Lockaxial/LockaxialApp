/**
 * 用于蓝牙门禁控制
 */
package com.androidex.lockaxial.util;

import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.os.Handler;

import com.androidex.lockaxial.service.MainService;

public class BleLockDevice extends BleDevice{
    public static byte COMMAND_HEAD=(byte)0xA1;
    public static byte COMMAND_SECOND=(byte)0xFA;
    public static byte COMMAND_SUCCESS=(byte)0x00;
    public static byte COMMAND_FAILED=(byte)0x01;

    private String deviceName=null;
    private String username=null;
    private String unitNo=null;

    public BleLockDevice(Context context,Handler handler, BluetoothDevice bluetoothDevice){
        super(context,handler,bluetoothDevice);
    }

    public void setInfo(String deviceName,String username,String unitNo){
        this.deviceName=deviceName;
        this.username=username;
        this.unitNo=unitNo;
    }

    private void encryptData(byte[] deviceData){
        if(deviceData.length==6){
            deviceData[0]=(byte)(deviceData[0]+20);
            deviceData[1]=(byte)(deviceData[1]+17);
            deviceData[2]=(byte)(deviceData[2]+05);
            deviceData[3]=(byte)(deviceData[3]+18);
            deviceData[4]=(byte)(deviceData[4]+12);
            deviceData[5]=(byte)(deviceData[5]+01);
        }
    }

    private byte[] getCommandData(){
        byte[] data=new byte[20];
        data[0]=COMMAND_HEAD;
        data[1]=COMMAND_SECOND;
        data[2]=(byte)0x10;
        byte[] deviceData=CommUtil.hexStringToBytes(deviceName);
        encryptData(deviceData);
        CommUtil.copyData(deviceData,data,3);
        byte[] mobileData=CommUtil.hexStringToBytes("0"+username);
        CommUtil.copyData(mobileData,data,9);
        byte[] unitData=CommUtil.hexStringToBytes(unitNo);
        CommUtil.copyData(unitData,data,15);
        data[19]=(byte)0x1a;
        return data;
    }

    protected void onConnected(){
        sendCommand(getCommandData());
    }

    protected void onFailed(int code){
        sendMessenge(MainService.MSG_OPEN_BLE_LOCK_FAILED,new Integer(code));
    }

    protected void onSuccess(){
        sendMessenge(MainService.MSG_OPEN_BLE_LOCK_SUCCESS,null);
    }
}
