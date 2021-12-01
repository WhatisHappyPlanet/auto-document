enum A {
  B = 0,
  C = 1,
}
interface PropsType {
  /** 标题 */
  title: string;
  /** 显示返回按钮 */
  showBack?: boolean;
  /** 显示右边按钮 */
  showRightButton?: boolean;
  /** 右边按钮文案 */
  rightButtonText?: string;
  /** 根据系统判断标题的位置，安卓会向左靠齐 */
  platformTitle?: boolean;
  // testasdsad
  test?: A;
}

export default class NavBar {}
