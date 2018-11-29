package com.androidex.lockaxial.util;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;

/**
 * Created by Administrator on 2017/2/18.
 */
public class UDPHandler {
    // 客户端
    private static DatagramSocket client;
    // 服务端地址
    private static InetAddress addr;
    // 服务端端口
    private static int port;
    // 单例
    private static UDPHandler udpHandler;

    private UDPHandler() {}

    public static synchronized UDPHandler getInstance() {
        try {
            client = new DatagramSocket();
            client.setSoTimeout(1500);
            addr = InetAddress.getByName("192.168.0.199");
            port = 9000;
            udpHandler = new UDPHandler();
        } catch (SocketException e) {
            e.printStackTrace();
        } catch (UnknownHostException e) {
            e.printStackTrace();
        }
        return udpHandler;
    }

    public String write(String data){
        try {
            /* 发送数据 */
            byte[] sendBuf = data.getBytes();
            DatagramPacket sendPacket = new DatagramPacket(sendBuf, sendBuf.length, addr, port);
            if(client.isClosed()){
                client.connect(addr,port);
            }
            client.send(sendPacket);

            /* 接收数据 */
            byte[] buff = new byte[1024];
            DatagramPacket recvPacket = new DatagramPacket(buff, buff.length);
            client.receive(recvPacket);
            String recvStr = new String(recvPacket.getData(), 0, recvPacket.getLength());
            System.out.println("接收:"+recvStr);

            return recvStr;
        } catch (SocketTimeoutException e) {
            // 设备连接超时
            return "-1";
        }catch (IOException e) {
            // 设备连接异常
            return "-2";
        }catch (Exception e) {
            // 未知异常
            return "-3";
        }finally {
            client.close();
        }
    }

    public static void main(String[] args) {
        UDPHandler client = UDPHandler.getInstance();
        String result = client.write("A002SNB");
        System.out.print(result);
    }
}
