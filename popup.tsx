import * as style from "./popup.module.css"

function IndexPopup() {
  return (
    <div
      style={{
        padding: 16
      }}>
      <div className={style.title}>Ada</div>
      <div className={style.content}>
        <div>保存你想要的视频</div>
        <a href="https://wj.qq.com/s2/12239193/f160" target="_blank">问题反馈</a>
      </div>
      
    </div>
  )
}

export default IndexPopup
