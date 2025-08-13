<template>
  <div class="video-container">
    <video
        :id="videoId"
        ref="videoPlayer"
        autoplay
        class="video"
        muted
        preload="auto"
    >
      <source :src="videoSrc" type="video/mp4"/>
    </video>
    <div v-if="videoSrc && isLoading" class="overlay">
      <div class="loader"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref,
  watch,
} from "vue";

// 定义props
const props = defineProps({
  videoSrc: {
    type: String,
    required: true,
  },
  videoId: {
    type: String,
    required: true,
  }
});

const isLoading = ref(true);
// 使用 ref 保存 WebRTC 服务器实例
const webRtcServer = ref(null);

const initWebRtcServer = async () => {
  // 开始加载，显示动画
  isLoading.value = true;

  setTimeout(() => {
    isLoading.value = false;
  }, 7000); // 延迟

  if (!webRtcServer.value) {
    webRtcServer.value = new WebRtcStreamer(
        props.videoId
    );
    // console.log(webRtcServer.value);
    // console.log(
    //   props.videoId,
    //   `${location.protocol}//${window.location.hostname}:8001`
    // );
  }

  try {
    await webRtcServer.value.connect(props.videoSrc);

    // 获取视频元素
    const videoElement = document.getElementById(
        props.videoId
    ) as HTMLVideoElement;
    if (videoElement) {
      // 隐藏视频元素
      videoElement.style.visibility = "hidden";

      // 监听canplay事件，确保视频可以播放
      videoElement.addEventListener("canplay", () => {
        // 延迟一秒后开始播放视频
        setTimeout(() => {
          videoElement
              .play()
              .then(() => {
                // 显示视频元素并隐藏加载动画
                videoElement.style.visibility = "visible";
                isLoading.value = false;
              })
              .catch((error) => {
                isLoading.value = false; // 确保即使在播放失败的情况下也隐藏加载动画
              });
        }, 800); // 延迟
      });

      // 视频加载异常，报错处理
      videoElement.addEventListener("error", () => {
        setTimeout(() => {
          isLoading.value = false;
        }, 7000); // 延迟
      });

      // 如果视频已经可以播放，触发canplay事件处理
      if (videoElement.readyState >= 3) {
        videoElement.dispatchEvent(new Event("canplay"));
      } else {
        videoElement.dispatchEvent(new Event("error"));
      }
    }
  } catch (error) {
    isLoading.value = false; // 确保即使在连接失败的情况下也隐藏加载动画
  }
};

// 断开 WebRTC 服务器连接
const disconnectWebRtcServer = () => {
  if (webRtcServer.value) {
    webRtcServer.value.disconnect();
    webRtcServer.value = null;
    // console.log("WebRTC Server disconnected");
  }
};

// 组件挂载时初始化 WebRTC 服务器
onMounted(() => {
  initWebRtcServer();
});

// 组件卸载前断开 WebRTC 服务器连接
onBeforeUnmount(() => {
  disconnectWebRtcServer();
});

// 页面激活时重新初始化 WebRTC 服务器
onActivated(() => {
  initWebRtcServer();
});

// 页面停用时断开 WebRTC 服务器连接
onDeactivated(() => {
  disconnectWebRtcServer();
});

// 监听 videoSrc 的变化，重新初始化 WebRTC 服务器
watch(
    () => props.videoSrc,
    (newVal, oldVal) => {
      if (newVal !== oldVal) {
        disconnectWebRtcServer();
        initWebRtcServer();
      }
    }
);
</script>

<style lang="scss" scoped>
.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url("@/assets/img/cam_1.png");
  background-size: 30%;
  background-position: 50% 50%;
  background-repeat: no-repeat;

  .video {
    width: 100%;
    height: 100%;
    object-fit: fill;
  }
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader {
  position: absolute;
  top: calc(50% - 25px);
  left: calc(50% - 25px);
  border: 4px solid #f3f3f3; /* Light grey */
  border-top: 6px solid #0072ff; /* Blue */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
