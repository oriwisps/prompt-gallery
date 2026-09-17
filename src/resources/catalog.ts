export type ResourceCategory = "brand" | "product" | "h5";
export interface DesignResource {
  id: string;
  title: string;
  subtitle: string;
  category: ResourceCategory;
  file: string;
  description: string;
  tags: string[];
  palette: string[];
  highlights: string[];
  interactions: string;
  dependencies: string[];
  guides: string[];
  defaults: { purpose: string; content: string; palette: string };
}
export const categories = { brand: "品牌展示", product: "工具界面", h5: "移动端 H5" };
export const resources: DesignResource[] = [
  {
    id: "calibre", title: "CALIBRE", subtitle: "机械制表品牌页", category: "brand",
    file: "caliber-precision-horology.html",
    description: "以机械表盘和精密参数讲述工艺，让细节成为页面的主角。",
    tags: ["机械美学", "SVG 表盘", "深色"], palette: ["#0c0c0e", "#c9ad7b", "#8ba7b8"],
    highlights: ["程序绘制的 SVG 表盘，刻度、指针与游丝形成视觉中心", "衬线标题与等宽参数形成层级，细线组织规格信息", "滚动描边与机械运动服务于工艺展示，减少动态时保留结构"],
    interactions: "向下滚动查看机芯结构与规格，点击导航跳转章节。",
    dependencies: ["Google Fonts 字体（fonts.googleapis.com / fonts.gstatic.com）", "Anime.js 4.2.2（cdn.jsdelivr.net，MIT）；已适配上游缺失的相对模块路径"],
    guides: ["brand-craft", "quality"],
    defaults: { purpose: "为一家独立机械腕表品牌制作产品展示页", content: "品牌故事、主打机芯、工艺细节、技术规格、预约咨询", palette: "近黑背景、香槟金强调色、钢蓝辅助色" },
  },
  {
    id: "morph", title: "MORPH", subtitle: "可变字体实验页", category: "brand",
    file: "morph-variable-type.html",
    description: "把字形本身作为视觉素材，用字重与字宽的变化构成展览。",
    tags: ["可变字体", "交互滑块", "极简"], palette: ["#101010", "#8c8c8c", "#eeeeee"],
    highlights: ["以一套可变字体建立标题、正文和展陈的视觉关系", "用滑块操控字重、字宽和光学尺寸，让变化可感知", "近单色层级与充足留白，减少动态时保留静态字重梯度"],
    interactions: "拖动字体参数滑块，观察字形变化；移动指针探索排版互动。",
    dependencies: ["Google Fonts：Roboto Flex 可变字体与 JetBrains Mono；字体加载失败会影响主要效果"],
    guides: ["brand-craft", "quality"],
    defaults: { purpose: "为一个字体设计工作室制作交互字体展示页", content: "字体介绍、字形试验、字重与字宽控制、应用样张、联系入口", palette: "近黑与暖白，靠透明度和字重建立层级" },
  },
  {
    id: "acru", title: "ACRU", subtitle: "团队效率仪表盘", category: "product",
    file: "acru-financial-dashboard.html",
    description: "浅色侧栏布局，把团队指标、进度与趋势放在一张清楚的工作台上。",
    tags: ["侧栏布局", "堆叠柱图", "浅色"], palette: ["#eef0ec", "#254d3b", "#c9e67e"],
    highlights: ["经典侧栏与顶部工具区，阅读顺序从核心指标到趋势", "堆叠柱图的提示跟随图表容器，半环仪表表达进度", "浅色中性底与绿色重点色，卡片依靠轻边界区分"],
    interactions: "悬停图表柱查看数值。部分导航和业务按钮仅为展示，不连接真实服务。",
    dependencies: ["GSAP 3.13.0（cdn.jsdelivr.net，使用 GSAP Standard License）"],
    guides: ["product-layout", "charts", "quality"],
    defaults: { purpose: "为小型团队制作效率与项目进度概览", content: "团队产出、任务完成率、周趋势、项目进度与成员表现；使用明确标注的演示数据", palette: "浅鼠尾草灰底、深绿文字、青柠重点色" },
  },
  {
    id: "subhub", title: "Subhub", subtitle: "订阅分析工作台", category: "product",
    file: "ledgerio-treasury-console.html",
    description: "以不对称卡片组织订阅指标，让总览、趋势和明细各有位置。",
    tags: ["Bento 布局", "环形仪表", "数据表"], palette: ["#202623", "#bef1cf", "#c5b9ec"],
    highlights: ["悬浮外壳与不对称双列，按内容用途决定卡片大小", "薄荷绿与薰衣草紫区分重点区域，深色卡片形成视觉锚点", "可切换环形仪表与带迷你条形图的明细表连接总量和结构"],
    interactions: "点击仪表区域的切换按钮观察数据变化。业务数据为演示，不代表真实订阅。",
    dependencies: ["GSAP 3.13.0（cdn.jsdelivr.net，使用 GSAP Standard License）"],
    guides: ["product-layout", "charts", "quality"],
    defaults: { purpose: "制作一个订阅业务的分析概览页面", content: "订阅总览、增长趋势、计划分布、关键指标和明细表；使用明确标注的演示数据", palette: "柔和浅底、深色重点卡、薄荷绿与薰衣草紫" },
  },
  {
    id: "peach", title: "PEACH DESK", subtitle: "日常记录工作台", category: "h5",
    file: "h5-peach-daily-desk.html",
    description: "用柔和渐变与同心圆环，承载一天中随手记下的小事。",
    tags: ["日常记录", "底部面板", "柔和渐变"], palette: ["#faf0e8", "#f0b6a5", "#c4b8e5"],
    highlights: ["手机容器与底部导航固定，内容区域独立滚动", "同心多弧圆环表达不同习惯，柔和卡面承载心情与饮水记录", "底部记录面板和触摸反馈，主要操作落在拇指可达区域"],
    interactions: "尝试记录饮水、切换心情或打开底部记录面板；记录仅用于本次预览演示。",
    dependencies: ["Google Fonts 字体（字体不可用时使用系统字体）"],
    guides: ["mobile-frame", "charts", "quality"],
    defaults: { purpose: "制作一个只在手机上使用的每日习惯记录原型", content: "今日习惯、饮水、心情、小任务与快捷记录；不加入医疗判断", palette: "奶油底、蜜桃色、薰衣草紫与柔和薄荷绿" },
  },
  {
    id: "brew", title: "烘豆日记", subtitle: "移动端咖啡商品页", category: "h5",
    file: "h5-brew-mobile-pdp.html",
    description: "从商品图到规格选择，把移动端购买流程整理成自然的纵向顺序。",
    tags: ["商品详情", "规格面板", "购物车反馈"], palette: ["#faf8f4", "#78513c", "#c34c36"],
    highlights: ["横向吸附图集与页码反馈，图片目前为 SVG 占位素材", "规格与数量在底部面板集中选择，价格随选项更新", "吸底购买栏考虑安全区，加购动画表达动作完成"],
    interactions: "滑动商品图、选择规格和数量、收藏或加入演示购物车；不会产生订单。",
    dependencies: ["Google Fonts 字体；商品图为源码内生成的 SVG 占位图"],
    guides: ["mobile-frame", "commerce", "quality"],
    defaults: { purpose: "为精品挂耳咖啡制作手机端商品详情原型", content: "商品图、风味说明、规格与数量选择、价格、收藏和模拟加购；不接支付", palette: "温暖浅底、咖啡棕与朱红强调色" },
  },
];

export interface DesignGuide { id: string; title: string; summary: string; points: string[]; file: string }
export const guides: DesignGuide[] = [
  { id: "brand-craft", title: "品牌页：让一个视觉主题贯穿全页", summary: "先确定页面要传达的个性，再选择排版、颜色与视觉效果。", file: "design-dna.md", points: ["用少量统一的颜色与字号层级建立辨识度。", "选择一个主要视觉效果并做完整，避免堆叠互相竞争的装饰。", "保证正文对比度、移动端可读性和减少动态模式下的完整表达。"] },
  { id: "product-layout", title: "工具界面：先安排任务，再安排卡片", summary: "信息密度服务于阅读与操作，让关键数据和下一步行动容易找到。", file: "product-ui.md", points: ["根据任务选择侧栏、分栏或卡片布局，不把品牌页的大标题与装饰照搬进后台。", "让指标、趋势和明细形成阅读顺序，说明数据的单位与时间范围。", "区分品牌强调色和成功、警告、失败等状态色，补齐空态与反馈。"] },
  { id: "charts", title: "图表：让数值关系可读", summary: "先明确比较、趋势或占比，再选择图形。", file: "chart-crafting.md", points: ["图表要有明确的标签、单位与数据范围，不能只靠颜色传达区别。", "把悬浮提示限制在图表区域，手机上提供可触摸的等价入口。", "动画只帮助理解变化，减少动态时直接呈现最终数值。"] },
  { id: "mobile-frame", title: "移动端：先做好容器与触摸", summary: "仅供手机使用的页面，优先考虑安全区、内部滚动和拇指操作。", file: "h5-mobile.md", points: ["固定导航与内容滚动区域职责清晰，给底栏和安全区留足空间。", "规格、记录等操作用底部面板承载，避免内容被键盘和底栏遮挡。", "触摸区域足够大，不依赖悬停；在手机尺寸验证每个主要动作。"] },
  { id: "commerce", title: "商品页：让选择与价格保持一致", summary: "把商品理解、规格选择和购买动作连接起来。", file: "commerce-ui.md", points: ["商品信息、价格、库存与当前规格对应，费用和限制明确呈现。", "选择规格和数量后立即反映结果，提交操作有明确反馈。", "避免虚假紧迫感，原型中的加购和购买需明确是演示。"] },
  { id: "quality", title: "交付检查：先确认可用，再检查细节", summary: "按实际承诺检查页面，真实运行比只看代码更有说服力。", file: "preflight.md", points: ["检查每个依赖确实可加载，页面和主要交互真实可用。", "核对承诺的布局、效果和内容，不能用装饰性占位代替功能。", "检查键盘焦点、文本对比、手机溢出与减少动态偏好。"] },
];

export function searchResources(query: string, category = "") {
  const tokens = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return resources.filter((item) => (!category || item.category === category) &&
    tokens.every((token) => [item.title, item.subtitle, item.description, categories[item.category], ...item.tags].join(" ").toLocaleLowerCase().includes(token)));
}
