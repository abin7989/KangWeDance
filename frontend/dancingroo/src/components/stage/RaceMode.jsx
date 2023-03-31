import React, { useRef, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import styled from "styled-components"
import Webcam from "react-webcam"
import DirectionModal from "./DirectionModal"
import PauseModal from "./PauseModal"
import PlayResult from "./PlayResult"
import Feedback from "./Feedback"
import { Overlay } from "../common/ui/Semantics"
import { ModalBtn } from "../status/HealthData"
import { useInterval } from "../../hooks/useInterval"
import useApi from "../../hooks/auth/useApi"
import bgImg from "../../assets/images/bgImg.png"

const tmPose = window.tmPose
const MODELURL =
  "https://teachablemachine.withgoogle.com/models/7g9Z9_ogC/model.json"
const METADATAURL =
  "https://teachablemachine.withgoogle.com/models/7g9Z9_ogC/metadata.json"
  
const Screen = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  .big {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  .small {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 400px;
  }
  /* .test {
    position: absolute;
    bottom: 0;
    left: 0;
  } */
  .background-img {
    position: absolute;
    z-index: -1;
    width:100%;
    height:100%;
  }
`

const MyOverlay = styled(Overlay)`
  top: 0;
  left: 0;
  justify-content: normal;
  .button {
    display: flex;
    flex-direction: row;
    position: absolute;
    right: 1rem;
    top: 0;
  }
`

function RaceMode() {
  const stageItem = useSelector((state) => state.stage.stageItem)
  const children = useSelector((state) => state.userState.children)
  const select = useSelector((state) => state.userState.select)

  const [camfocus, setCamfocus] = useState(false)
  const [model, setModel] = useState(null)
  const [aimedPosture, setAimedPosture] = useState(null)
  const [prevPosture, setPrevPosture] = useState(10)
  // const [motionCount, setMotionCount] = useState(0)
  const [count, setCount] = useState(0)
  const [scoreRecordList, setScoreRecordList] = useState([])
  const [showGreat, setShowGreat] = useState(false)
  const [showGood, setShowGood] = useState(false)
  const [showCheerUp, setShowCheerUp] = useState(false)
  const [showReadyGo, setShowReadyGo] = useState(false)
  const [isDirectionModalOpen, setIsDirectionModalOpen] = useState(false)
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false)
  const camref = useRef(null)
  const videoref = useRef(null)

  const [afterDirection, setAfterDirection] = useState(false)
  const [gameStart, setGameStart] = useState(false)
  const [playTime, setPlayTime] = useState(null)

  const playTimeline = stageItem.songMotionList

  const playRecord = useApi()

  // 처음에 모델 불러오기
  useEffect(() => {
    settingModel()
  }, [])
  
  // 자세 변경에 따라 카운트 올리기
  useInterval(
    () => {
      if (!isPauseModalOpen) {
        setCount((count) => count + 1)
      }
    },
    (prevPosture !== 10 && aimedPosture) ? aimedPosture?.countDelay : null
  )
  
  // 60fps로 predict 함수 돌리기
  useInterval(
    () => {
      predict()
    },
    1000 / 60
  )

  // 모델 불러오기 함수
  const settingModel = async function () {
    const model = await tmPose.load(MODELURL, METADATAURL)
    setModel(() => model)
    console.log("MODEL LOADED")
  }

  // 모달 열기/닫기 함수 -> time 따로 만들어서 저장후 다시 돌리기
  const handleIsPauseModalOpen = () => {
    if (!afterDirection) {
      if (!isPauseModalOpen) {
        videoref.current.pause()
      } else {
        videoref.current.play()
      }
    }
    setIsPauseModalOpen((prev)=>!prev)
  }

  // 예측 함수 - 캠에 따라 자세 상태(prevPosture)를 바꿈
  const predict = async function () {
    if (!model || !aimedPosture || isPauseModalOpen) {
      return
    }
    const { pose, posenetOutput } = await model.estimatePose(
      camref.current.video
    )
    const prediction = await model.predict(posenetOutput)
    const rtPosture = prediction[aimedPosture.danceIndex-1]
    setPrevPosture((prevPosture) => {
      if (
        rtPosture.probability.toFixed(2) > aimedPosture.accuracy &&
        prevPosture === aimedPosture.danceIndex-1
      ) {
        return prevPosture
      } else if (rtPosture.probability.toFixed(2) > aimedPosture.accuracy) {
        return aimedPosture.danceIndex-1
      } else {
        return 10
      }
    })
  }

  // 캠 위치 바꾸기 함수
  const switchVideo = () => {
    setCamfocus(!camfocus)
  }
  
  // test
  // const handleShowResult = () => {
  //   setPlayTime(playTimeline[playTimeline.length-1]?.endTime * 1000)
  // }

  // test
  // const replay = () => {
  //   videoref.current.currentTime = videoref.current.duration - 1
  //   videoref.current.play()
  // }

  // //test
  // const openGreatFeedback = () => {
  //   setShowGreat(true)
  //   setTimeout(() => setShowGreat(false), 3000)
  // }

  // //test
  // const openGoodFeedback = () => {
  //   setShowGood(true)
  //   setTimeout(() => setShowGood(false), 3000)
  // }

  // //test
  // const openCheerupFeedback = () => {
  //   setShowCheerUp(true)
  //   setTimeout(() => setShowCheerUp(false), 3000)
  // }

  // //test
  // const openReadyGoFeedback = () => {
  //   setShowReadyGo(true)
  //   setTimeout(() => setShowReadyGo(false), 3000)
  // }

  // //test
  // const plusCount = () => {
  //   setCount((prev)=>prev+1)
  // }

  const handleAfterDirection = () => {
    setAfterDirection(true)
    setCamfocus(true)
    setIsDirectionModalOpen(true)
  }

  const handleIsDirectionModalOpen = () => {
    setIsDirectionModalOpen(false)
    setShowReadyGo(true)
    setTimeout(() => setShowReadyGo(false), 3000)
    setTimeout(() => setGameStart(true), 3000)
  }

  useInterval(
    () => {
      if (gameStart && !isPauseModalOpen) {
        setPlayTime((prev)=> prev + 10)
        const filteredTimeline = playTimeline.find(
          (e) =>
            e.startTime * 1000 < playTime &&
            e.endTime * 1000 > playTime
        );
        if (filteredTimeline?.startTime !== aimedPosture?.startTime) {
          if (aimedPosture) {
            let scoreRecord = {}
            scoreRecord.danceIndex = aimedPosture.danceIndex
            scoreRecord.count = count
            scoreRecord.time = aimedPosture.endTime - aimedPosture.startTime
            scoreRecord.countStandard = aimedPosture.countStandard
            setScoreRecordList([...scoreRecordList, scoreRecord])
          }
          setAimedPosture(filteredTimeline)
          setCount(0)
        }
        if (filteredTimeline && playTime >= filteredTimeline.endTime * 1000 - 1000  && playTime < filteredTimeline.endTime * 1000) {
          if (!showGreat && !showGood && !showCheerUp) {
            if (count > filteredTimeline.countStandard) {
              setShowGreat(true)
              setTimeout(() => setShowGreat(false), 2000)
            } else if (count > filteredTimeline.countStandard / 2) {
              setShowGood(true)
              setTimeout(() => setShowGood(false), 2000)
            } else {
              setShowCheerUp(true)
              setTimeout(() => setShowCheerUp(false), 2000)
            }
          }  
        }
      }
      if (playTime && playTime > playTimeline[playTimeline.length-1]?.endTime * 1000) {
        setGameStart(false)
      }
    },
    10
  )

  useEffect(() => {
    if (scoreRecordList.length === playTimeline?.length) {
      const playData = {
        childIdx: children[select].childIdx,
        songIdx: stageItem.songIdx,
        playMode: stageItem.playMode,
        scoreRecordList: scoreRecordList,
      }
      playRecord.fetchApi('POST', '/play', playData)
    }
  },[scoreRecordList])

  // // test
  // useInterval(
  //   () => {
  //     if (!isPauseModalOpen) {
  //       setMotionCount((count) => count + 1)
  //     }
  //   },
  //   (prevPosture !== 10 && aimedPosture) ? aimedPosture?.countDelay : null
  // )

  return (
    <Screen>
      <img className="background-img" src={bgImg} alt="background" />
      {!playRecord.isLoading ? 
      <>
        <PlayResult data={playRecord.data.data} playMode={stageItem.playMode}/>
      </>
      :
      <>
        <Webcam
          className={camfocus ? "big" : "small"}
          ref={camref}
          mirrored={true}
        />
        <MyOverlay>
          <Feedback showGreat={showGreat} showGood={showGood} showCheerUp={showCheerUp} showReadyGo={showReadyGo}/>
          <div className="button">
            {/* <ModalBtn>{motionCount}</ModalBtn> */}
            {!afterDirection && <ModalBtn onClick={switchVideo}>화면 전환</ModalBtn>}
            <ModalBtn onClick={handleIsPauseModalOpen}>나가기</ModalBtn>
          </div>
          {/* <div className="test">
            <ModalBtn onClick={handleShowResult}>플레이 시간 종료</ModalBtn>
            <ModalBtn onClick={replay}>종료 전으로 가기</ModalBtn>
            <ModalBtn onClick={plusCount}>Count +1</ModalBtn>
            <ModalBtn onClick={openReadyGoFeedback}>ReadyGo</ModalBtn>
            <ModalBtn onClick={openGreatFeedback}>Great</ModalBtn>
            <ModalBtn onClick={openGoodFeedback}>Good</ModalBtn>
            <ModalBtn onClick={openCheerupFeedback}>Cheer Up</ModalBtn>
            <h1>
              평가자세 : {aimedPosture?.danceIndex || "X"}
            </h1>          
            <h1>
              현재자세 : {prevPosture}
            </h1>
            <h1>
              자세점수 : {count}
            </h1>
            <h1>
              시간 : {playTime}
            </h1>             
          </div> */}
        </MyOverlay>
        {!afterDirection && 
        <video
          className={camfocus ? "small" : "big"}
          ref={videoref}
          src={stageItem.videoUrl !== 'url' ? stageItem.videoUrl : `https://d3qb4vbeyp8phu.cloudfront.net/%EB%8F%99%EB%AC%BC.MOV`} // 빼기
          onCanPlayThrough={()=>videoref.current.play()}
          onEnded={handleAfterDirection}
        />}
        <PauseModal handleIsModalOpen={handleIsPauseModalOpen} isOpen={isPauseModalOpen} />
        <DirectionModal handleIsModalOpen={handleIsDirectionModalOpen} isOpen={isDirectionModalOpen} />
      </>
      }
    </Screen>
  )
}

export default RaceMode