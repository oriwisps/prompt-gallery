# 截图中的 AI 提示词

按原图编号整理，仅提取“AI 描述词”区域。截图 5 为编号 07，截图 6 为编号 06，以下按编号排列。

## 02 流体胶囊形变 · Fluid Morph
实现胶囊按钮向弹窗面板的流体形态变换，尺寸与圆角采用高阻尼流体曲线（Fluid Morph）无缝过渡。

## 03 共享元素无缝展开 · Shared Element
实现Card到详情页的共享元素转场（Shared Element Transition），背景与Card容器做连续平滑缩放。

## 04 磁吸游标与滚动码表 · Snap Odometer
折线图横向滑动带数据点磁吸吸附，顶部数值使用滚动计数器（Odometer / Ticker）实时平滑联动。

## 05 阻尼弹性抽屉 · Bottom Sheet
实现支持阻尼橡皮筋回弹的底部抽屉（Bottom Sheet），松手根据手势滑动速度（Velocity）自动计算吸附锚点。

## 06 动态弥散光晕边框 · Conic Glow
为Card添加旋转渐变描边（Conic Gradient Border），底部附带动态模糊的呼吸弥散背光。

## 07 物理弹簧交错流 · Stagger Cascade
列表元素入场使用交错动画（Stagger Delay），每个子项带微弱弹性向上滑入（Spring Cascade）。

## 08 弹性微缩触觉反馈 · Press Scale
按钮按压添加scale(0.96)物理弹性压缩与深度内阴影，释放时触发轻微超调回弹（Spring Overshoot）。

## 使用

- 打开 `index.html` 选择案例，每个子目录的 `index.html` 可离线独立运行。
- `cases.json` 可通过提示词效果库的备份导入功能一次导入七个案例。
- `node examples/motion-lab/build.mjs` 从源码重新生成独立 HTML 与导入 JSON，不写数据库。
- `node examples/motion-lab/build.mjs --install` 仅插入尚不存在的案例，不覆盖已有版本或用户编辑。
- 演示图形为内嵌 SVG；不依赖在线图片、字体或动画库。
- 这里复现的是提示词定义的交互，使用原创雪山插画，不复制截图中的滑雪照片或短视频平台界面。按压反馈为视觉效果，不调用设备振动。
