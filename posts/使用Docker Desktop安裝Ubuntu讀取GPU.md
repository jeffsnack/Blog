---
title: 使用Docker Desktop安裝Ubuntu讀取GPU
date: 2026-02-27
tags: [Docker環境配置]

---

# Win10使用Docker安裝Tensorflow-gpu環境(含Jupyter Notebook)

---

## 參考資料

在安裝的時候感謝各位大神的幫助

於是希望在這邊簡單的把小弟我在安裝時遇到的方法(踩坑)跟各位分享

[文章_Nvidia Docker安裝說明(含WSL2)](https://ithelp.ithome.com.tw/m/articles/10285253?fbclid=IwAR2KgQFNhq98Eyoq2Bd_iIMQ179h_80_Fau4HcmXf2iD2R0d3cB4hJVnpi8)

[影片_Tensorflow with GPU on Windows WSL using Docker](https://www.youtube.com/watch?v=YozfiLI1ogY)

---

## 安裝順序

1. Docker Desktop
2. Ubuntu(wsl2)
3. Nvidia_toolkit(Nvidia工具包)
4. Tensorflow_gpu(docker_image)

在Windows10直接裝tensorflow會遇到版本不支援的問題(tensorflow 2.10.0後的版本不直接支援GPU)

另外如果要在程式裡面使用NVIDIA的GPU加速AI模型運算的話

必須要額外再下載CUDA,Cudnn,還有NVIDIA_toolkit

簡而言之就是NVIDIA全家桶

過程有點繁瑣環境配置也不是那麼友善

有時候還會跟Python的版本衝突到QQ

使用Docker的好處就是它把Tensorflow、CUDA、Cudnn等環境都包在一起

你只需要在本機的環境裡面裝好你的NVIDIA顯卡的驅動程式

其他的Docker都幫你處理好了

以下的安裝假設NVIDIA的顯示卡驅動程式都已經下載安裝了

如果還沒安裝的可以參考上面的影片有安裝驅動的教學


---

### Docker Desktop安裝

可以參考這篇文章下載Docker Desktop

可以到官方網站[這裏下載](https://www.docker.com/products/docker-desktop/)

[【Docker】基本介紹與安裝 Docker Desktop](https://ithelp.ithome.com.tw/articles/10340809)

---

### 安裝Ubuntu(wsl2)

假設已經安裝完Docker Desktop再來就是Ubuntu的安裝

進入到Windows的命令提示字元(cmd)

![image](https://hackmd.io/_uploads/r1TPQYV0T.png)

輸入
```
wsl --install
```

系統提示如果有顯示Ubuntu的版本就表示安裝成功

或是可以使用

```
wsl --version
```

如果有跳出版本訊息就表示安裝成功

---

### 到Docker的Setting查看是否有裝成功

如果安裝好Docker後又安裝完Ubuntu

這時候應該可以在Docker的設定側邊欄Resources裡面的WSL integration看到Ubuntu的開關選項(*記得把它打開)

![image](https://hackmd.io/_uploads/HJapcONCT.png)


---

## 安裝NVIDIA_Toolkit

裝完Ubuntu後

在cmd的命令行輸入指令

```
Ubuntu
```

就可以進入Ubuntu

如果是第一次進入的話系統應該會要求建立使用者與密碼

就建立一個就行了


![image](https://hackmd.io/_uploads/B1wB4K4AT.png)

*要輸入以下的指令時必須要進入到Ubuntu內部


接著要先把nvidia的package server給加進apt的source list

這邊建議先一行一行的複製貼上確認是否可以執行


#### 確定你的發行版本
```
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
```


#### 添加 NVIDIA GPG 密鑰
```
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
```

#### 添加 NVIDIA 容器庫到你的源列表

這三行是一起的

另外如果碰上無法複製貼上到cmd需要手動打指令的情況的話(我就是QQ)

要注意sudo跟sed這兩個前面的\符號沒有空格

這邊如果沒注意的話系統會報錯
```
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
```

添加成功的話cmd應該會跳出deb開頭的訊息

#### 安裝NVIDIA_Toolkit

```
sudo apt-get update
```

```
sudo apt-get install -y nvidia-docker2
```

等安裝訊息跑完後就可以先把Docker關掉重開了

---

## 到DockerHub找自己喜歡的Tensorflow版本

Tensorflow的官方有把各個版本的Dockerfile檔案放在Dockerhub上

[官方的Dockerfile下載](https://hub.docker.com/r/tensorflow/tensorflow/tags)

可以挑選自己喜歡的版本下載

比如在Filter Tags的這個搜尋欄打上想要的版本關鍵字

Ex:2.10

就可以找到了

這邊我們就選擇latest-gpu-jupyter這個tag的Dockerfile下載

![image](https://hackmd.io/_uploads/SkRAwtNAp.png)


以下是Tensorflow官方對於各個版本Tag的說明

![image](https://hackmd.io/_uploads/BJK1YK4Cp.png)


如果沒有特別愛好的話

可以下載latest-gpu-jupyter這個版本就可以了



---


### 掛載資料夾

要拉image之前先再把Docker Desktop開起來

等下載完後我們可以直接看到image

```dockerfile!
docker run -v <要掛載的資料夾路徑>:/tf --gpus all -p 8888:8888 -d --name jupyter_notebook_gpu tensorflow/tensorflow:latest-gpu-jupyter
```

* `-v`  掛載資料夾指令,前面接需要掛載的資料夾,可以選擇自己寫好的ipynb檔案及訓練資料放入這個資料夾,後面的:/tf是放入到這個image的tf資料夾裡
* `--gpus all`  這邊是允許容器使用所有的GPU,要啟用GPU這邊一定要輸入這個指令
* `--name` 後面是Container的名稱,可以取自己喜歡的,沒有需求的話就跟指令一樣就行了

例如訓練資料及ipynb檔案在D:\python_projects裡面

就可以把指令裡面的資料夾的路徑修改成D:\python_projects

確定後就可以輸入指令等待image下載到Docker Desktop了

## 2025更新

由於tensorflow 2.16.1版本在讀取GPU時會有讀不到的bug存在，這邊建議使用較為穩定的2.15.0版本


```dockerfile!
docker run -v <要掛載的資料夾路徑>:/tf --gpus all -p 8888:8888 -d --name jupyter_notebook_gpu tensorflow/tensorflow:2.15.0-gpu-jupyter
```

### Docker Desktop版本問題

承上題，經過反覆測試，我的Docker Desktop版本目前在4.28，這似乎會造成CUDA一些讀取上面的問題，看Github的Issue有人提到過似乎是Docker Desktop的一些小bug，已經在4.31以上的版本修復，建議有遇到問題的可以參考一下更新Docker Desktop版本這個解決方案

[TensorFlow Cuda in Docker under WSL2 not wokring](https://github.com/tensorflow/tensorflow/issues/68710)


---

### 啟動Jupyter Notebook

下載完後你的Container裡面就會有一個Jupyter_notebook_gpu

點選右邊的啟動鍵就可以運行了

![image](https://hackmd.io/_uploads/HJsjXqERT.png)

接著點選Jupyter_notebook_gpu進入到這個畫面



點選log裡面找到https://127.0.0.1開頭的網址

點選後就可以成功進入到Jupyter Notebook裡面看到我們掛載的資料夾檔案了

如果要讀取這個目錄裡的檔案路徑就是`/tf/檔案名稱`

![image](https://hackmd.io/_uploads/ByEYU9EA6.png)

---

### 檢查是否有讀取到GPU


```terminal=
docker ps #檢查正在運行中的container
```

```terminal=
docker exec -it <container_id_or_name> bash
```

有跳出GPU的話就代表成功囉

```python=
import tensorflow as tf

print(tf.config.list_logical_devices())
```

![image](https://hackmd.io/_uploads/rJqUdq4C6.png)







