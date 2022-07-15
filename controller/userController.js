require('dotenv').config()

const jwt = require("jsonwebtoken");
const passport = require('passport');
const { users } = require('../models/index');
const posts = require('../models/posts');
const like = require('../models/like');
const axios = require('axios');

//카카오 로그인
const kakaoCallback = (req, res, next) => {
  console.log(users,'이 친구는 지나가나요')  
      passport.authenticate(
        'kakao',
        
        { failureRedirect: '/' },
        (err, users, info) => {
          console.log(users,'여기서 문제가 발생하지요')
            if (err) return next(err)
            //----------------------------------------------------------------
            console.log('콜백')
            const { userId, nickname, userImage, host } = users;
            const token = jwt.sign({ userId }, process.env.MY_KEY)

            result = {
                userId,
                token,
                nickname,
                userImage,
                host
            }
            console.log('카카오 콜백 함수 결과', result)
            res.send({ users: result })
        }
    )(req, res, next)
}



// 구글 로그인

const googleCallback = (req, res, next) => {
  passport.authenticate(
      'google',
      { failureRedirect: '/' },
      (err, users, info) => {
          if (err) return next(err)
          console.log('콜백')
          const { userId, nickname, userImage, host } = users
          const token = jwt.sign({ userId }, 'mendorong-jeju')

          result = {
              userId,
              token,
              nickname,
              userImage,
              host
          }
          console.log('구글 콜백 함수 결과', result)
          res.send({ users: result })
      }
  )(req, res, next)
}




// 네이버 로그인

const naverCallback = (req, res, next) => {
  passport.authenticate(
      'naver',
      { failureRedirect: '/' },
      (err, users, info) => {
          if (err) return next(err)
          console.log('콜백')
          const { userId, nickname, userImage, host } = users
          const token = jwt.sign({ userId }, process.env.MY_KEY)

          result = {
              userId,
              token,
              nickname,
              userImage,
              host
          }
          console.log('네이버 콜백 함수 결과', result)
          res.send({ users: result })
      }
  )(req, res, next)
}


//로그인 인증
async function checkMe(req, res) {
    const userId  = res.locals.userId
    const nickname = res.locals.nickname
    const userImage = res.locals.userImage
    
    res.send({
      success:true,
      userId,
      nickname,
      userImage

    });
  };

// 마이페이지 정보
 async function Mypage (req, res) {
  // const {userId} = req.params;
  const nickname = res.locals.nickname;
  const userImage = res.locals.userImage;
  const host = res.locals.host
  // const myposts = await posts.findOne({where : {nickname}});
  // const mypostlist = myposts.map((a) => ({
  //     postId : a.postId
  //   }));
  // const likelist = await like.findOne({where : {nickname}});
   res.json({
      result : true,
      nickname,
      userImage,
      host
      // mypostlist,  //DB 수정이 필요
      // likelist     //DB 수정이 필요 
    })
 }
// 마이페이지 정보 수정
//닉네임
 async function MypagePutname (req, res) {
 // try {
    const userId = res.locals.userId
    const {nickname} = req.body;

    const existnicName = await users.findOne({where : {nickname}});
    // res.locals.nickname = existnicName.nickname
    if(existnicName) {
      return res.status(400).send({result : false, errorMessage : "중복된 닉네임 사용중입니다."});

    }else{
      await users.update({nickname},{where:{userId}})
      res.status(200).send({result : true, message :"수정 완료"})
    }
  // } catch (error) {
  //   res.status(400).send({result : false, errorMessage: "닉네임 수정 실패.",});
  // }
 }

//  //프로필이미지
//  async function MypagePutImage (req, res) {
//   try {
//     const {userId} = res.locals.users;
//     const {userImage} = req.body;

//     const profileImage = await users.findByIdAndUpdate(userId, {$set:{userImage}});
//     res.json({result : true, msg : "작성 완료", profileImage});
//   } catch (error) {
//     res.json({result : false});
//   }
//  }

// 사업자등록번호 검증

async function CNU_CK (req, res, next) {
  const CNU = req.body.CNU;   //사업자 등록번호

  var data = {
    "b_no": [CNU], // 사업자번호 "xxxxxxx" 로 조회 시,
   }; 
  const CNU_CK = await postCRN(CNU);
  
   console.log(data)
  // Company Number check
  async function postCRN(crn){
    const postUrl = "https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=hsmMPV8Yvh7MAswqXiCCcM%2BlWTuetywv5slb0C2xYqLlwk1Qrqp%2BbChwrRIEvBHmVzPxy%2BR9%2FYcZ08ZUa65rHQ%3D%3D"

        const result  = await axios.post(postUrl,JSON.stringify(data),{ headers: { 'Content-Type': 'application/json' } }
        ).then((res) => { 
          return res.data.data[0].tax_type

          
        }).catch((err)=> {
          console.log(err)
        });
        if (result !== '국세청에 등록되지 않은 사업자등록번호입니다.'){
          const userId = res.locals.userId
          await users.update({host:true}, {where:{userId}})
          res.status(200).send({result : true, message :"멘도롱 제주의 호스트가 되셨습니다."})
        }
          console.log(result)
        }
        next();
  };

module.exports = {
  kakaoCallback, googleCallback, naverCallback,
  checkMe, Mypage, MypagePutname, CNU_CK //MypagePutImage
}