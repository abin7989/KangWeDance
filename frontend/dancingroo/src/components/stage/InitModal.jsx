import React from "react";
import styled from "styled-components";
import {Wrapper, Header, Main, Article, Section, H1, H2, Footer} from "../common/ui/Semantics";
import dance_direction1 from "../../assets/images/dance_direction1.png"
import dance_direction2 from "../../assets/images/dance_direction2.png"
import { PinkButton } from "../common/ui/Semantics";

export const ModalWrapper = styled(Wrapper)`
    display:${({isModalOpen})=>isModalOpen? "flex":"none"};
    border:1px solid transparent;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    border-radius:10px;
    position: fixed;
    top: 0; bottom: 0; left: 0; right: 0;
    margin:auto;
    width: 70%;
    height: 85%;
    background-color: white;
    z-index: 3;
    letter-spacing:0.2rem;
    
`;

const ModSection = styled(Section)`
  img{
    height:70%;
    width:70%;
  }

`

function InitModal({initModalHanddler, isOpen}) {
  console.log(isOpen)
  return (
      <ModalWrapper isModalOpen={isOpen}>
          <Main>
              <Section>
                <img src={dance_direction2} alt="" />
                <h3>정확한 자세 측정을 위해,</h3>
                <h3>머리부터 발끝까지 전신이 보이도록 위치해주세요!</h3>
              </Section>
          </Main>
          <Footer>
            <PinkButton onClick={()=>initModalHanddler()}>준비됐어요!</PinkButton>
          </Footer>
      </ModalWrapper>
  );
}

export default InitModal;