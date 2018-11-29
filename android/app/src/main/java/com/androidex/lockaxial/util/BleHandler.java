/**
 * 用于APP管理
 */
package com.androidex.lockaxial.util;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.os.Handler;
import android.os.Message;

import com.androidex.lockaxial.service.MainService;

import java.util.HashMap;

public class BleHandler {
    private static final long SCAN_PERIOD = 10000;
    private Thread checkThread=null;
    private Handler handler=null;
    private Context context=null;
    private boolean isScanning=false;
    private HashMap<String,BluetoothDevice> deviceList=new HashMap<String,BluetoothDevice>();

    public static BluetoothAdapter bluetoothAdapter=BluetoothAdapter.getDefaultAdapter();

    /**
     * 构造函数，创建一个BleHandler对象，需要传入Context
     */
    public BleHandler(Context context,Handler handler){
        this.context=context;
        this.handler=handler;
    }

    public void startScan(){
        deviceList.clear();
        scanLeDevice(false);
        scanLeDevice(true);
    }

    public void stopScan(){
        scanLeDevice(false);
    }

    private void scanLeDevice(final boolean enable) {
        if (enable) {
            // Stops scanning after a pre-defined scan period.
            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    isScanning = false;
                    bluetoothAdapter.stopLeScan(leScanCallback);
                }
            }, SCAN_PERIOD);

            isScanning = true;
            bluetoothAdapter.startLeScan(leScanCallback);
        } else {
            isScanning = false;
            bluetoothAdapter.stopLeScan(leScanCallback);
        }
    }

    protected void onDeviceFound(String name){
        sendMessenge(MainService.MSG_FIND_BLE_LOCK,name);
    }

    // Device scan callback.
    private BluetoothAdapter.LeScanCallback leScanCallback =
        new BluetoothAdapter.LeScanCallback() {
            @Override
            public void onLeScan(final BluetoothDevice device, int rssi, byte[] scanRecord){
                String name=device.getName();
                if(name!=null&&name.startsWith("NPBLE-")){
                    deviceList.put(name,device);
                    onDeviceFound(name);
                }
            }
        };

    public void openBleLock(String deviceName,String username,String unitNo){
        BluetoothDevice device=deviceList.get("NPBLE-"+deviceName);
        BleLockDevice bleLockDevice=new BleLockDevice(context,handler,device);
        bleLockDevice.setInfo(deviceName,username,unitNo);
        bleLockDevice.openBleDevice();
    }

    protected void sendMessenge(int code,Object object){
        Message message = handler.obtainMessage();
        message.what =code;
        message.obj = object;
        handler.sendMessage(message);
    }
}
