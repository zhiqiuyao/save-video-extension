import type { PlasmoCSConfig } from "plasmo"
import Toastify from "toastify-js"

import { relayMessage, sendToBackground } from "@plasmohq/messaging"
import { relay } from "@plasmohq/messaging/relay"

import "toastify-js/src/toastify.css"

export const config: PlasmoCSConfig = {
  matches: ["*://*.douyin.com/*", "*://*.kuaishou.com/*"]
}

export {}

function toast(text: string) {
  Toastify({
    text,
    duration: 1000,
    style: {
      height: "auto",
      left: "50%",
      right: "auto",
      transform: "translate(-50%, 0)"
    }
  }).showToast()
}

function download(url: string, filename: string) {
  let ua = navigator.userAgent.toLowerCase()
  console.log(ua.match(/version\/([\d.]+).*safari/))

  if (ua.match(/version\/([\d.]+).*safari/)) {
    window.open(url)
  } else {
    sendToBackground({
      name: "download",
      body: {
        filename,
        url
      }
    })
  }
}

function getElement(css) {
  return new Promise((resolve, reject) => {
    let num = 0

    let timer = setInterval(function () {
      num++

      let domList = document.querySelectorAll(css)
      let dom = Array.from(domList).find(node => node.getAttribute("src"))

      if (dom) {
        clearInterval(timer)

        resolve(dom)
      } else {
        if (num == 20) {
          clearInterval(timer)
          resolve(false)
        }
      }
    }, 300)
  })
}

function dyVideoDownload() {
  window.addEventListener("load", function () {
    async function getControls() {
      let videoDom = await getElement(".xg-video-container")

      if (!videoDom) {
        console.log("没有找到DOM")
        return
      }

      let vsNav = document.querySelector(".fuy_wmct:nth-of-type(5)")

      if (window.location.href.indexOf("vsdetail") != -1) {
        console.log("综艺栏目关闭下载")
        return
      }

      createDyVideoDownload()

      let videoPlayDomAll = document.querySelectorAll("video")

      let videoIndex =
        videoPlayDomAll.length > 1
          ? videoPlayDomAll.length - 2
          : videoPlayDomAll.length - 1

      let videoPlayDom = videoPlayDomAll[videoIndex]

      //let videoPlayDom = videoPlayDomAll.length>1?videoPlayDomAll[videoPlayDomAll.length-2]:videoPlayDomAll[videoPlayDomAll.length-1];

      videoPlayDom.addEventListener(
        "ended",
        function () {
          //结束

          console.log("播放结束")

          let autoPlay = document.querySelector(".xg-switch-checked")

          if (autoPlay) {
            getControls()
            return
          }
        },
        false
      )

      document
        .querySelector("#toDownload")
        .addEventListener("click", function () {
          toast("正在下载请稍侯")

          let info = document.querySelectorAll(".Pz8t2meP")

          let filename

          if (info.length > 0) {
            let account = info[videoIndex].innerText

            //let titleArr = info[videoIndex*2+1].innerText.split('#');

            let vt = document.querySelectorAll(".xhDopcQ_")

            let title = vt[videoIndex].innerText.split("#")

            filename = title[0]
              ? title[0] + account
              : title[1] + account + ".mp4"
          } else {
            filename = new Date().getTime() + ".mp4"
          }

          download(videoPlayDom.children[0].src, filename)
        })


      return
    }

    getControls()

    window.addEventListener("wheel", getControls)

    window.addEventListener("keydown", function (e) {
      if (e.code == "ArrowDown" || e.code == "ArrowUp") {
        getControls()
      }
    })

    async function insertedDom() {
      let videoDom = (await getElement("video")) as HTMLVideoElement

      if (!videoDom) {
        console.log("没有找到DOM")
        return
      }

      videoDom.addEventListener("DOMNodeInserted", (e) => {
        getControls()
      })
    }

    insertedDom()

    window.addEventListener("click", getControls)
  })
}
function createDyVideoDownload() {
  let controlAll = document.querySelectorAll(".xg-right-grid")

  let controls =
    controlAll.length > 1
      ? controlAll[controlAll.length - 2]
      : controlAll[controlAll.length - 1]

  let videoDownloadDom = document.querySelector("#zhmDouyinDownload")

  if (videoDownloadDom) {
    videoDownloadDom.parentNode.parentNode.removeChild(
      videoDownloadDom.parentNode
    )

    //videoDownloadDom.parentNode.parentNode.parentNode.removeChild(videoDownloadDom.parentNode.parentNode)
  }

  let playSeting = controls.querySelector(".xgplayer-playback-setting")

  let downloadDom = playSeting.cloneNode(true) as HTMLDivElement

  downloadDom.style = "margin-right:20px;"

  //let downloadText = downloadDom.querySelector('div:first-child > span:first-child');

  let downloadText = downloadDom.querySelector("div:first-child")

  downloadText.innerText = "下载"

  downloadText.style = "font-size:12px;font-weight:400;"

  downloadText.setAttribute("id", "zhmDouyinDownload")

  let detail = controls.querySelector("xg-icon:nth-of-type(1)").children[0]

  let linkUrl = detail.getAttribute("href")
    ? detail.getAttribute("href")
    : location.href

  if (linkUrl.indexOf("www.douyin.com") == -1) {
    linkUrl = "//www.douyin.com" + linkUrl
  }

  downloadText.setAttribute("data-url", linkUrl)

  downloadText.removeAttribute("target")

  downloadText.setAttribute("href", "javascript:void(0);")

  downloadDom.onmouseover = function () {
    downloadDom.className = "xgplayer-playback-setting slide-show"
  }

  downloadDom.onmouseout = function () {
    downloadDom.className = "xgplayer-playback-setting"
  }

  let downloadHtml = ""

  let downloadOption = [
    { name: "直接下载", id: "toDownload" },
    // { name: "复制链接", id: "toCopy" },
    { name: "打开文件", id: "toLink" }
  ]
  downloadOption.forEach(function (item) {
    downloadHtml += `<div class="xgplayer-playratio-item ${item.id}" id="${item.id}">${item.name}</div>`
  })

  downloadDom.querySelector(".xgplayer-playratio-wrap").innerHTML = downloadHtml

  downloadDom.querySelector(".xgplayer-slider").style = "width:60px important;"

  let autoPlay = document.querySelector(".xgplayer-autoplay-setting")

  autoPlay.after(downloadDom)

  let divDom = document.createElement("div")

  divDom.style =
    "position: absolute;z-index:-999;height:80px;width:40px;margin-top:-80px;"

  downloadDom.appendChild(divDom)

  document.querySelector(".toLink").addEventListener("click", function () {
    let videoPlayDomAll = document.querySelectorAll("video")

    let videoIndex =
      videoPlayDomAll.length > 1
        ? videoPlayDomAll.length - 2
        : videoPlayDomAll.length - 1

    let videoPlayDom = videoPlayDomAll[videoIndex]
    window.open(videoPlayDom.children[0].src)
  })
}

function ksVideoDownload() {
  window.addEventListener("load", function () {
    async function getControls() {
      console.log('getControls refresh')
      let videoDom = (await getElement(".player-video")) as HTMLVideoElement

      if (!videoDom) {
        console.log("没有找到DOM")
        return
      }

      if (videoDom.getAttribute("src").match(/^blob/)) {
        console.log("blob视频无法下载")
        return
      }

      createKsVideoDownload(videoDom)

      videoDom.addEventListener(
        "ended",
        function () {
          let autoPlay = document
            .querySelector(".auto-warpper")
            .getAttribute("autoplay")

          if (autoPlay) {
            getControls()
            return
          }
        },
        false
      )

      document
        .querySelector("#toDownload")
        .addEventListener("click", function () {
          toast("正在下载请稍侯")

          let playTimeTotal = document.querySelector(".total").innerText

          let second = playTimeTotal.match(/(.+):(.+)/)

          let secondTotal = second[1] * 60 + parseInt(second[2])

          let dataUrl = document
            .querySelector("#zhmKsDownload")
            .getAttribute("data-url")

          let account = document.querySelector(".profile-user-name-title")
            ? document.querySelector(".profile-user-name-title").innerText
            : document.querySelector(".feed-author").innerText

          let title = document.querySelector(".video-info-title")
            ? document.querySelector(".video-info-title").innerText
            : new Date().getTime()

          let videoFileName =
            account && title
              ? account + "-" + title + ".mp4"
              : new Date().getTime() + ".mp4"
          download(dataUrl, videoFileName)
        })

      document.querySelector("#toLink").addEventListener("click", function () {
        window.open(videoDom.getAttribute("src"))
      })
    }

    getControls()

    document.addEventListener("click", function (e) {
      getControls()
    })

    window.addEventListener("wheel", getControls)

    window.addEventListener("keydown", function (e) {
      if (e.code == "ArrowDown" || e.code == "ArrowUp") {
        getControls()
      }
    })
  })
}

function createKsVideoDownload(videoDom) {
  let match = /^https?:\/\/www\.kuaishou\.com\/(.+)/

  let resp = location.href.match(match)

  if (
    !resp ||
    (resp[1].indexOf("short-video") == -1 &&
      resp[1].indexOf("video") == -1 &&
      resp[1].indexOf("new-reco") == -1)
  ) {
    console.log("当前不是视频播放页")
    return
  }

  if (resp[1].indexOf("short-video") != -1) {
    let playerArea = document.querySelector(
      ".video-container-player"
    ) as HTMLVideoElement

    let playerAreaWidth = playerArea.style.width.match(/(.+)px/)

    let playerBarProgress = document.querySelector(".player-bar-progress")

    playerBarProgress.style.width = playerAreaWidth[1] - 300 + "px"

    let timeTotal = document.querySelector(".total")

    timeTotal.style.right = "160px"
  }

  let controls = document.querySelector(".right")

  let videoDownloadDom = document.querySelector("#zhmKsDownload")

  if (videoDownloadDom) {
    videoDownloadDom.parentNode.removeChild(videoDownloadDom)
  }

  let detailDom = controls.querySelector("div:nth-of-type(1)")

  let xgIcon = detailDom.cloneNode(true)

  let linkUrl = videoDom.getAttribute("src")

  xgIcon.querySelector(".kwai-player-volume-sound").innerHTML =
    "<div style='cursor:pointer;'>下载</div>"

  let slider = xgIcon.querySelector(".pl-slider")

  slider.style = "width:49px;padding:10px 5px 20px;"

  let downloadList = ""

  let downloadOption = [
    { name: "直接下载", id: "toDownload" },
    // { name: "复制链接", id: "toCopy" },
    { name: "打开文件", id: "toLink" }
  ]
  downloadOption.forEach(function (item) {
    downloadList += `<div style="margin-top:10px;color:#FFF;cursor:pointer;" id="${item.id}">${item.name}</div>`
  })

  slider.innerHTML = downloadList

  xgIcon.setAttribute("data-url", linkUrl)

  xgIcon.setAttribute("id", "zhmKsDownload")

  //console.log(xgIcon);

  //xgIcon.innerHTML="<div style='cursor:pointer;'>下载</div>";

  detailDom.before(xgIcon)

  //重构播放操作按钮

  let zhmKsButton = document.querySelector("#zhmKsButton")

  //console.log(zhmKsButton);

  if (zhmKsButton) {
    //zhmKsButton.parentNode.removeChild(zhmKsButton);

    return false
  }

  let buttonIcon = detailDom.cloneNode(true)
  //console.log(buttonIcon);
  buttonIcon.setAttribute("id", "zhmKsButton")

  let buttonIconImg = buttonIcon.querySelector(".unmuted-icon")

  if (buttonIconImg) {
    buttonIconImg.style =
      "background: url(https://s2-10623.kwimgs.com/udata/pkg/cloudcdn/img/player-setting.ad1f5ce8.svg) no-repeat"
  }

  detailDom.after(buttonIcon)

  let plSlider = buttonIcon.querySelector(".pl-slider")

  plSlider.style = "width:auto;padding:10px 10px 25px 10px;"

  plSlider.innerHTML = ""

  let buttonFour = controls.querySelector("div:nth-of-type(4)")

  buttonFour.style.margin = "0px"

  let autoPlay = document.querySelector(".play-setting-container")

  if (autoPlay) {
    autoPlay.style.margin = "0px 40px 0px 0px"
  }

  let buttonFive = controls.querySelector("div:nth-of-type(5)")

  if (buttonFive) {
    buttonFive.style.margin = "15px 0px"

    buttonFive.onmouseover = function () {
      setTimeout(function () {
        let toolTip = document.querySelector(".kwai-player-rotate-tooltip")

        if (toolTip) {
          toolTip.parentNode.removeChild(toolTip)
        }
      }, 30)
    }

    plSlider.appendChild(buttonFive)
  }
  let buttonSix = controls.querySelector("div:nth-of-type(6)")

  if (buttonSix) {
    buttonSix.style.margin = "15px 0px"

    let toolTip = document.querySelector(".kwai-player-fullscreen-tooltip")

    buttonSix.onmouseover = function () {
      setTimeout(function () {
        let toolTip = document.querySelector(".kwai-player-fullscreen-tooltip")

        if (toolTip) {
          toolTip.parentNode.removeChild(toolTip)
        }
      }, 30)
    }

    plSlider.appendChild(buttonSix)
  }
  plSlider.appendChild(buttonFour)
}

if (location.host.includes("douyin")) {
  dyVideoDownload()
}
if (location.host.includes("kuaishou")) {
  ksVideoDownload()
}
