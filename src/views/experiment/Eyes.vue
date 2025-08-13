<template>
  <div class="eyes-container">
    <div ref="rendererContainer" class="renderer-container"></div>

    <div class="control-panel">
      <div class="control-group">
        <label>左眼视线 X:</label>
        <input type="range" v-model="leftEyeGaze.x" min="-1" max="1" step="0.01" @input="updateEyes">

        <label>左眼视线 Y:</label>
        <input type="range" v-model="leftEyeGaze.y" min="-1" max="1" step="0.01" @input="updateEyes">

        <label>左眼开合度:</label>
        <input type="range" v-model="leftEyelidOpenness" min="0.1" max="1" step="0.01" @input="updateEyes">
      </div>

      <div class="control-group">
        <label>右眼视线 X:</label>
        <input type="range" v-model="rightEyeGaze.x" min="-1" max="1" step="0.01" @input="updateEyes">

        <label>右眼视线 Y:</label>
        <input type="range" v-model="rightEyeGaze.y" min="-1" max="1" step="0.01" @input="updateEyes">

        <label>右眼开合度:</label>
        <input type="range" v-model="rightEyelidOpenness" min="0.1" max="1" step="0.01" @input="updateEyes">
      </div>

      <div class="control-group">
        <label>疲劳程度:</label>
        <input type="range" v-model="fatigueLevel" min="0" max="1" step="0.01" @input="updateEyes">

        <label>瞳孔大小:</label>
        <input type="range" v-model="pupilSize" min="0.1" max="0.4" step="0.01" @input="updateEyes">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, reactive } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default defineComponent({
  name: 'TechEyesDisplay',
  setup() {
    // 响应式数据
    const rendererContainer = ref<HTMLElement | null>(null);
    const leftEyeGaze = reactive({ x: 0, y: 0 });
    const rightEyeGaze = reactive({ x: 0, y: 0 });
    const leftEyelidOpenness = ref(1.0);
    const rightEyelidOpenness = ref(1.0);
    const fatigueLevel = ref(0);
    const pupilSize = ref(0.2);

    // Three.js相关变量
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;
    let leftEye: THREE.Group;
    let rightEye: THREE.Group;
    let leftPupil: THREE.Mesh;
    let rightPupil: THREE.Mesh;
    let leftIris: THREE.Mesh;
    let rightIris: THREE.Mesh;
    let animationFrameId: number;

    // 科技风配色
    const TECH_COLORS = {
      sclera: 0x0a1a2a,       // 深蓝色巩膜
      iris: 0x00ffff,         // 青色虹膜
      pupil: 0x000000,        // 黑色瞳孔
      eyelid: 0x14283d,       // 深蓝灰色眼皮
      cornea: 0xffffff,       // 白色角膜
      highlight: 0x4df8ff,    // 高亮青色
      wireframe: 0x4df8ff     // 科技风线框颜色
    };

    // 初始化场景
    const initScene = () => {
      if (!rendererContainer.value) return;

      // 1. 创建场景
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x020a13); // 深色背景

      // 2. 创建相机
      camera = new THREE.PerspectiveCamera(
          45,
          rendererContainer.value.clientWidth / rendererContainer.value.clientHeight,
          0.1,
          1000
      );
      camera.position.set(0, 0, 10);

      // 3. 创建渲染器
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(
          rendererContainer.value.clientWidth,
          rendererContainer.value.clientHeight
      );
      renderer.shadowMap.enabled = true;
      rendererContainer.value.appendChild(renderer.domElement);

      // 4. 添加轨道控制器
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.maxPolarAngle = Math.PI;
      controls.minPolarAngle = 0;
      controls.maxAzimuthAngle = Math.PI / 2;
      controls.minAzimuthAngle = -Math.PI / 2;
      controls.target.set(0, 0, 0);

      // 5. 添加灯光
      addLights();

      // 6. 创建眼球模型
      createEyes();

      // 7. 添加坐标辅助
      addHelpers();

      // 8. 开始动画循环
      animate();

      // 9. 窗口大小调整事件
      window.addEventListener('resize', onWindowResize);
    };

    // 添加灯光
    const addLights = () => {
      // 环境光
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      scene.add(ambientLight);

      // 方向光1 (主光源)
      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight1.position.set(1, 1, 1);
      directionalLight1.castShadow = true;
      scene.add(directionalLight1);

      // 方向光2 (补光)
      const directionalLight2 = new THREE.DirectionalLight(TECH_COLORS.highlight, 0.5);
      directionalLight2.position.set(-1, -1, 1);
      scene.add(directionalLight2);

      // 点光源 (眼睛高光)
      const pointLight = new THREE.PointLight(TECH_COLORS.highlight, 1, 10);
      pointLight.position.set(0, 0, 5);
      scene.add(pointLight);
    };

    // 创建眼球模型
    const createEyes = () => {
      // 左眼
      leftEye = createEye(-1.5, 0);
      // 右眼
      rightEye = createEye(1.5, 0);

      scene.add(leftEye);
      scene.add(rightEye);
    };

    // 创建单个眼球
    const createEye = (x: number, y: number): THREE.Group => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(x, y, 0);

      // 巩膜 (科技风深色)
      const scleraGeometry = new THREE.SphereGeometry(1, 32, 32);
      const scleraMaterial = new THREE.MeshPhongMaterial({
        color: TECH_COLORS.sclera,
        emissive: 0x000000,
        emissiveIntensity: 0.1,
        specular: TECH_COLORS.highlight,
        shininess: 30,
        wireframe: false,
        transparent: true,
        opacity: 0.95
      });
      const sclera = new THREE.Mesh(scleraGeometry, scleraMaterial);
      eyeGroup.add(sclera);

      // 添加科技风线框
      const wireframe = new THREE.LineSegments(
          new THREE.EdgesGeometry(scleraGeometry),
          new THREE.LineBasicMaterial({
            color: TECH_COLORS.wireframe,
            transparent: true,
            opacity: 0.3
          })
      );
      sclera.add(wireframe);

      // 虹膜 (科技风青色)
      const irisGeometry = new THREE.CircleGeometry(0.4, 32);
      const irisMaterial = new THREE.MeshPhongMaterial({
        color: TECH_COLORS.iris,
        emissive: TECH_COLORS.iris,
        emissiveIntensity: 0.2,
        specular: 0xffffff,
        shininess: 50,
        side: THREE.DoubleSide
      });
      const iris = new THREE.Mesh(irisGeometry, irisMaterial);
      iris.position.z = 0.98;
      eyeGroup.add(iris);

      // 瞳孔
      const pupilGeometry = new THREE.CircleGeometry(pupilSize.value, 32);
      const pupilMaterial = new THREE.MeshBasicMaterial({
        color: TECH_COLORS.pupil
      });
      const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
      pupil.position.z = 0.99;
      eyeGroup.add(pupil);

      // 角膜 (透明反光层)
      const corneaGeometry = new THREE.SphereGeometry(1.01, 32, 32);
      const corneaMaterial = new THREE.MeshPhongMaterial({
        color: TECH_COLORS.cornea,
        transparent: true,
        opacity: 0.1,
        specular: 0xffffff,
        shininess: 100
      });
      const cornea = new THREE.Mesh(corneaGeometry, corneaMaterial);
      eyeGroup.add(cornea);

      // 保存关键部分的引用
      if (x < 0) { // 左眼
        leftPupil = pupil;
        leftIris = iris;
      } else { // 右眼
        rightPupil = pupil;
        rightIris = iris;
      }

      // 眼皮
      updateEyelid(eyeGroup, 1.0, x < 0);

      return eyeGroup;
    };

    // 更新眼皮状态
    const updateEyelid = (eyeGroup: THREE.Group, openness: number, isLeftEye: boolean) => {
      // 移除旧的眼皮
      eyeGroup.children = eyeGroup.children.filter(child => child.userData.isEyelid !== true);

      if (openness < 1.0) {
        // 创建上眼皮
        const eyelidGeometry = new THREE.SphereGeometry(1.05, 32, 32, 0, Math.PI * 2, 0, Math.PI * (1 - openness));
        const eyelidMaterial = new THREE.MeshPhongMaterial({
          color: TECH_COLORS.eyelid,
          emissive: TECH_COLORS.eyelid,
          emissiveIntensity: 0.1,
          specular: TECH_COLORS.highlight,
          shininess: 20,
          side: THREE.BackSide,
          wireframe: false,
          transparent: true,
          opacity: 0.9
        });
        const upperEyelid = new THREE.Mesh(eyelidGeometry, eyelidMaterial);
        upperEyelid.rotation.x = Math.PI / 2;
        upperEyelid.userData.isEyelid = true;

        // 添加疲劳效果 (红血丝)
        if (fatigueLevel.value > 0.5) {
          const bloodVesselsGeometry = new THREE.SphereGeometry(1.06, 64, 64, 0, Math.PI * 2, 0, Math.PI * (1 - openness));
          const bloodVesselsMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: fatigueLevel.value * 0.3,
            wireframe: true
          });
          const bloodVessels = new THREE.Mesh(bloodVesselsGeometry, bloodVesselsMaterial);
          bloodVessels.rotation.x = Math.PI / 2;
          upperEyelid.add(bloodVessels);
        }

        eyeGroup.add(upperEyelid);
      }
    };

    // 更新眼睛状态
    const updateEyes = () => {
      // 更新视线方向
      leftPupil.position.x = leftEyeGaze.x * 0.3;
      leftPupil.position.y = leftEyeGaze.y * 0.3;
      rightPupil.position.x = rightEyeGaze.x * 0.3;
      rightPupil.position.y = rightEyeGaze.y * 0.3;

      // 更新眼皮状态
      updateEyelid(leftEye, leftEyelidOpenness.value, true);
      updateEyelid(rightEye, rightEyelidOpenness.value, false);

      // 更新疲劳效果
      updateFatigueEffects();

      // 更新瞳孔大小
      updatePupilSize();
    };

    // 更新疲劳效果
    const updateFatigueEffects = () => {
      // 虹膜颜色变化 (疲劳时变暗)
      const irisHue = 0.5 - fatigueLevel.value * 0.1; // 从青色(0.5)向蓝绿色(0.4)变化
      const irisSaturation = 1.0 - fatigueLevel.value * 0.3;
      const irisBrightness = 0.8 - fatigueLevel.value * 0.2;

      leftIris.material.color.setHSL(irisHue, irisSaturation, irisBrightness);
      rightIris.material.color.setHSL(irisHue, irisSaturation, irisBrightness);

      // 眼睛湿润度 (疲劳时减少反光)
      leftEye.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhongMaterial) {
          child.material.shininess = 100 - fatigueLevel.value * 70;
        }
      });

      rightEye.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhongMaterial) {
          child.material.shininess = 100 - fatigueLevel.value * 70;
        }
      });
    };

    // 更新瞳孔大小
    const updatePupilSize = () => {
      // 左眼
      leftPupil.geometry.dispose();
      leftPupil.geometry = new THREE.CircleGeometry(pupilSize.value, 32);

      // 右眼
      rightPupil.geometry.dispose();
      rightPupil.geometry = new THREE.CircleGeometry(pupilSize.value, 32);
    };

    // 添加辅助工具
    const addHelpers = () => {
      // 坐标轴辅助
      const axesHelper = new THREE.AxesHelper(3);
      scene.add(axesHelper);

      // 网格辅助
      const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
      scene.add(gridHelper);
    };

    // 动画循环
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    // 窗口大小调整
    const onWindowResize = () => {
      if (rendererContainer.value && camera && renderer) {
        camera.aspect = rendererContainer.value.clientWidth / rendererContainer.value.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
            rendererContainer.value.clientWidth,
            rendererContainer.value.clientHeight
        );
      }
    };

    // 组件挂载时初始化
    onMounted(() => {
      initScene();
    });

    // 组件卸载时清理
    onUnmounted(() => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', onWindowResize);
      if (rendererContainer.value && renderer) {
        renderer.dispose();
      }
    });

    return {
      rendererContainer,
      leftEyeGaze,
      rightEyeGaze,
      leftEyelidOpenness,
      rightEyelidOpenness,
      fatigueLevel,
      pupilSize,
      updateEyes
    };
  }
});
</script>

<style scoped>
.eyes-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: linear-gradient(135deg, #020a13 0%, #0a1a2a 100%);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
}

.renderer-container {
  flex: 1;
  width: 100%;
  min-height: 500px;
  position: relative;
}

.control-panel {
  padding: 15px;
  background: rgba(10, 26, 42, 0.7);
  border-top: 1px solid rgba(77, 248, 255, 0.2);
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.control-group {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  color: #4df8ff;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.control-group input[type="range"] {
  width: 100%;
  background: rgba(77, 248, 255, 0.1);
  height: 4px;
  border-radius: 2px;
  -webkit-appearance: none;
}

.control-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4df8ff;
  cursor: pointer;
}
</style>
