// 회원가입-정보 등록
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {Wrapper, Header, Main, Article, Section, H1, H2, P, Footer, PinkButton} from "../../common/ui/Semantics";
import kangkang from "../../../assets/images/kangkang.png"
import useApi from "../../../hooks/auth/useApi";
import { login, getChildState,patchChildState,childSelect } from "../../../store/userSlice";
import { useDispatch,useSelector } from "react-redux";

const ModWrapper = styled(Wrapper)`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display:flex;
    flex-direction:column;
    position:fixed;
    align-items:center;
    z-index:-1;
    left:0;
    bottom:-5rem;
    h2{
        padding:0;
        margin-bottom:-1rem;
    }
`

const ModMain = styled(Main)`
    flex-direction:row;
    min-width: 20rem;
    height:25rem;
    &{
        border:none;
    }
    padding-bottom:-10rem;
`;
const ModSection = styled(Section)`
    border:none;
    flex-direction:column;
    /* align-items:center; */
    justify-content:space-around;
    /* height:100%; */
    &>${Article}{
       height:6.5rem;
       text-align:start;
       width:80%;
       flex-direction:column; 
       border:none;
       .kids-state{
        flex-direction:column;
        width:100%;
       }
    }
`
export const FormLabel = styled.label`
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    align-self:flex-start;
    margin-left:1.5rem;
`;

export const FormInput = styled.input`
    height: 2.1rem;
    min-width: 5rem;
    font-size: 0.8rem;
    background-color: #f8f8f8;
    border: solid 1px #e5e5e5;
    border-radius: 6px;
    padding: 0 1em;
`;

const FormInputButton = styled.input`
    height: 2.1rem;
    width: 5rem;
    font-size: 0.8rem;
    font-weight: 600;
    background-color: ${props=>props.color==="true"? "#FFD731":"#ffffff"};
    border: solid 1px #e5e5e5;
    border-radius: 0.5rem;
    padding: 0 1em;
    margin-left: 1rem;
    margin-right: 1rem;
    cursor: pointer;
`;

const ProfileImage = styled.img`
    height:4.5rem;
`;

const MyButton = styled(PinkButton)`
    width:6.2rem;
    height:2.5rem;
    letter-spacing:0.2rem;
    font-size:0.9rem;
`
function RegisterChild({userPage}) {
    const selectedIdx = useSelector(state=>state.userState.select)
    const {nickname, weight, height, gender, profileImageUrl, childIdx, birthDate} = useSelector(state=>state.userState.children[selectedIdx||0]) // 디폴트는 첫째
    const addChild = useSelector(state=>state.userState.addChild)
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const getImgUrl = useApi()
    const addNewChild = useApi()
    const {data, isLoading, error, fetchApi} = useApi()
    const deleteChild = useApi()
    const [btnColor, setBtnColor] = useState(gender)
    const fileInput = useRef(null);

    useEffect(()=>{
        if (error){
            console.error(error)
        }
        if (data||addNewChild.data||deleteChild.data) {
            alert('아이 프로필 업데이트 완료되었습니다.')
            dispatch(childSelect(0))
            navigate('/play')
        }
    },[data, error,addNewChild.data,deleteChild.data])
    const handleUploadImg=(e)=>{
        const file = e.target.files[0]
        const formData = new FormData();
        formData.append('file', file);
        // getImgUrl.fetchApi('POST', "/children/profile", {file:file})
    }
    const uploadImg=()=>{
        fileInput.current.click()
    }
    const handleDeleteChild = async()=>{
        await deleteChild.fetchApi('DELETE', `/children?childIdx=${childIdx}`)
    }
    const SumbitChild = ()=>{
        const body = {
            nickname,
            birthDate,
            gender,
            weight,
            height,
            ProfileImageUrl:profileImageUrl||"https://kangwedance.s3.ap-northeast-2.amazonaws.com/기본+프로필+이미지.png",
        }
        const patchBody = {
            nickname,
            birthDate,
            gender,
            ProfileImageUrl:profileImageUrl||"https://kangwedance.s3.ap-northeast-2.amazonaws.com/기본+프로필+이미지.png",
            childIdx,
        }
        if (addChild) addNewChild.fetchApi('POST', '/children', body)
        else fetchApi('PATCH', '/children', patchBody)
    }
    const handleInputChange = (e) => {
        let { name, value } = e.target;
        if (name==="gender"){
            if(value==="남자아이"){
                value=false
                setBtnColor(value)
            } else {
                value=true
                setBtnColor(value)
            }
        }
        if(name==="weight"||name==="height") value = Number(value) 
        dispatch(patchChildState({selectedIdx,name,value}));
    };
    return (
        <ModWrapper>
            <ModMain>
                <ModSection>
                    <Article>
                        <FormLabel htmlFor="nickname"> 닉네임</FormLabel>
                        <FormInput value={nickname||''} type="text" name="nickname" id="nickname" placeholder=" 닉네임" onChange={handleInputChange}/>
                    </Article>
                    <Article>
                        <FormLabel htmlFor="gender"> 성별</FormLabel>
                        <div>
                            <FormInputButton type="button" color={gender? "false":"true"} value="남자아이" name="gender" onClick={handleInputChange}/>
                            <FormInputButton type="button" color={gender? "true":"false"}  value="여자아이" name="gender" onClick={handleInputChange}/>
                        </div>
                    </Article>
                    <Article>
                        <FormLabel htmlFor="birthDate"> 생년월일</FormLabel>
                        <FormInput value={birthDate||''} type="date" name="birthDate" id="birthDate" placeholder=" 닉네임" onChange={handleInputChange}/>
                    </Article>
                </ModSection>
                <ModSection>
                    <Article>
                        <FormLabel> 사진</FormLabel>
                        <div className="profile-container">
                        <ProfileImage src={profileImageUrl||kangkang}/>
                            <FormInputButton className="white-black-line-btn" color="white" type="button" value="수정" onClick={()=>uploadImg()}/>
                            <input ref={fileInput} type="file" style={{ display: "none" }}          onChange={(e) => {handleUploadImg(e)}}
                            />
                            <FormInputButton className="white-black-line-btn" color="white" type="button" value="삭제" />
                        </div>
                    </Article>
                    <Article>
                        <div className="kids-state">
                            <FormLabel htmlFor="height">키</FormLabel>
                            <FormInput value={height||''} type="text" name="height" id="height" placeholder=" cm" onChange={handleInputChange} disabled={!addChild}/>
                        </div>
                    </Article>
                    <Article>
                        <div className="kids-state">
                            <FormLabel htmlFor="weight"> 체중</FormLabel>
                            <FormInput value={weight||''} type="text" name="weight" id="weight" placeholder=" kg" onChange={handleInputChange} disabled={!addChild}/>
                        </div>
                    </Article>
                </ModSection>
            </ModMain>
            <Footer>
                <MyButton onClick={()=>SumbitChild()}>{!addChild? '수정하기' : '등록하기'}</MyButton>
                <MyButton style={{display: !addChild? 'flex':'none'}} onClick={()=>handleDeleteChild()}>삭제하기</MyButton>
            </Footer>
        </ModWrapper>
    )
}

export default RegisterChild;