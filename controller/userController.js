require('dotenv').config()

const jwt = require("jsonwebtoken");
const passport = require('passport');
const { images, posts, users, mypage, like, sequelize, Sequelize } = require("../models");
// const { users } = require('../models/index');
// const posts = require('../models/posts');
// const like = require('../models/like');
const axios = require('axios');
const { cache } = require('ejs');


//카카오 로그인
const kakaoCallback = (req, res, next) => {
        passport.authenticate(
        'kakao',
        
        { failureRedirect: '/' },
        (err, users, images, info) => {
          console.log(users, images,'여기서 문제가 발생하지요')
            if (err) return next(err)
            //----------------------------------------------------------------
            console.log('콜백')
            const { userImageURL } = images;
            const { userId, nickname, host, email } = users;
            const token = jwt.sign({ userId }, process.env.MY_KEY)

            result = {
                userId,
                token,
                nickname,
                userImageURL,
                host,
                email
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
      (err, users, images, info) => {
          if (err) return next(err)
          console.log('콜백')
          const { userImageURL } = images;
          const { userId, nickname, host, email } = users
          const token = jwt.sign({ userId }, 'mendorong-jeju')

          result = {
              userId,
              token,
              nickname,
              userImageURL,
              host,
              email
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
      (err, users, images, info) => {
          if (err) return next(err)
          console.log('콜백')
          const { userImageURL } = images;
          const { userId, nickname, host, email } = users
          const token = jwt.sign({ userId }, process.env.MY_KEY)

          result = {
              userId,
              token,
              nickname,
              userImageURL,
              host,
              email
          }
          console.log('네이버 콜백 함수 결과', result)
          res.send({ users: result })
      }
  )(req, res, next)
}


//로그인 인증
async function checkMe(req, res) {
    const {userId, nickname, userImageURL, email, host}  = res.locals
    
  res.send({
      success:true,
      email,
      userId,
      nickname,
      userImageURL,
      host
    });
  };

// // 마이페이지 생성

// async function CreateMypage (req, res) {
//   const {userId} = res.locals
  
  
//   const mypageinf = await posts.findAll({
//     where : {userId}
//   })

//   const mypageinfmap = mypageinf.map((mypageinfo) =>({
//     nickname : mypageinfo.nickname,
//     title : mypageinfo.title,
//     commentNum : mypageinfo.commentNum,
//     likeNum : mypageinfo.likeNum,
//   }))
//   console.log(mypageinfmap,'여기가 포스트에서 가지고오는거');
//   const mypagecreate = await mypage.create({
//     mypageinfmap
//     // thumbnailURL,
//   })
//   // const thumbnail = await images.findAll({
//   //   where : {postId}
//   // })
//   console.log(mypageinfmap);
//   res.status(200).send({mypagecreate});
//   // res.json({
//   //   mypageinf
//   // })
// }


//마이페이지 정보 - 1
 async function Mypage (req, res) {
  const {userId} = res.locals;
  // const {nickname, userImageURL, host, email, userId} = res.locals;
  
  // 내가 쓴 게시물
  const mypostlist = await posts.findAll({
    where : {userId},
    include: [{
      model: images,
      attributes: ['postId', 'thumbnailURL']
    }],
    // attributes: ['postId', 'thumbnailURL'],

  });
  console.log(mypostlist);
  const mypostinfo = mypostlist.map((postinfo) => ({
    title : postinfo.title,
    nickname : postinfo.nickname,
    commentNum : postinfo.commentNum,
    likeNum : postinfo.likeNum
  }))
  console.log(mypostinfo, '여기에 images가 들어감?');
  const mypostthumbnail = mypostlist.map((poststhumbnail) =>({
    thumbnailURL : poststhumbnail.thumbnailURL
  }))
  console.log(mypostthumbnail, '이거 undefined?');
  res.json({
    mypostinfo,
    mypostthumbnail
  })
  // const mypageThumbnail = await images.findAll({
  //   where: {userId},


  // })

  // const mypageThumbnailMap = mypageThumbnail.map(mypageThumbnailMap => mypageThumbnailMap.thumbnailURL)
  // // console.log(mypageThumbnail.thumbnailURL, '여기도 안지나가나')
  // console.log(mypageThumbnailMap, '여기는 지나가길')

  // mypageThumbnailMap.forEach((element, i) => {
  //   const thumbnailURL = mypageThumbnailMap[i]
  //   console.log(thumbnailURL);

  //   const mypageThumnail = mypageImage.map((mypageinfo) =>({
  //   nickname : mypageinfo.nickname,
  //   title : mypageinfo.title,
  //   commentNum : mypageinfo.commentNum,
  //   likeNum : mypageinfo.likeNum,
  //   thumbnailURL : mypageinfo.thumbnailURL,
  // }))

  // res.json({
  //   result : true,
  //   // mypostlist,
  //   // mylikelist,
  //   mypageThumnail  //DB 수정이 필요
  //        //DB 수정이 필요 
  // })
  // })
 }


// // 좋아요 누른 게시물
//   const likelist = await like.findAll({where : {userId}});
//   const mylikelist = likelist.map((b) =>{

//   })
//    res.json({
//       result : true,
//       // mypostlist,
//       // mylikelist,
//       mypageThumnail  //DB 수정이 필요
//            //DB 수정이 필요 
//     })
//  }

// 마이페이지 정보 - 2
 


// 마이페이지 정보 수정
//닉네임
 async function MypagePutname (req, res) {
 try {
    const image = req.files;
    const userId = res.locals.userId
    const userImageKEY = image.map((userImageKEY) => userImageKEY.key);
    const userImageURL = image.map((userImageURL) => userImageURL.location);
    const {nickname} = req.body;
    // console.log(image ,'이미지 찍히나요');
    if (image.length > 0) {
      const existImage = await images.findOne({where : {userId}})
      
    if (existImage) {
      const userImages = await images.update({userImageKEY: userImageKEY.toString(),userImageURL: userImageURL.toString()},
      {where :{userId},});
      res.status(200).send({userImages,userImageKEY, userImageURL, msg: "성공합니다" })
    }
    } else{
      
      const puserImages = await images.findOne({where: {userId}});
      // console.log(puserImages.userImageURL , '이미지');
      const existUserImage = puserImages.userImageURL
      const existUserImagekey = puserImages.userImageKEY
      console.log(existUserImagekey, '키 로그');
      // const s3 = new AWS.S3();

      // if (images.userImageKEY !== null) {
      //   const params = {
      //     Bucket: process.env.AWS_BUCKET_NAME,
      //     Delete: {
      //       Objects: existUserImagekey.map(existUserImagekey => ({ Key: existUserImagekey })), 
      //     }
      //   };
      //   s3.deleteObjects(params, function(err, data) {
      //     if (err) console.log(err, err.stack); // error
      //     else { console.log("S3에서 삭제되었습니다"), data }; // deleted
      //   });
      // }
      
      
      res.status(200).send({existUserImage, existUserImagekey, msg: "성공" })
      
    }
    
    
    

    const existnicName = await users.findOne({where : {nickname}});
    const pnickname = await users.findOne({where : {userId}});
    // console.log(pnickname,'이거 찍히나');
    // console.log(pnickname.nickname,'닉네임');
    if(pnickname.nickname == nickname) {
      return
    }
    if(existnicName) {
      return res.status(400).send({result : false, errorMessage : "중복된 닉네임 사용중입니다."});

    }else{
      await users.update({nickname},{where:{userId}})
      res.status(200).send({result : true, message :"수정 완료"})
    }
  } catch (error) {
    res.status(400).send({result : false, errorMessage: "닉네임 수정 실패.",});
  }
 }


// 사업자등록번호 검증

async function CNU_CK (req, res, next) {
  const CNU = req.body.CNU;   //사업자 등록번호
  console.log(CNU)
  var data = {
    "b_no": [CNU], // 사업자번호 "xxxxxxx" 로 조회 시,
   }; 
  const CNU_CK = await postCRN(CNU);
  
   console.log(data)
  // Company Number check
  async function postCRN(crn){
    try {
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
      } else {
        res.status(404).send({result : true, message :"국세청에 등록되지 않은 사업자등록번호입니다."})
      }

      } catch (error) {
        console.error(error);
        res.status(404).send({
          errorMEssage: '국세청에 등록되지 않은 사업자등록번호입니다.',
      })
        return;
    }
  }
  next();
};

module.exports = {
  kakaoCallback, googleCallback, naverCallback,
  checkMe, Mypage, MypagePutname, CNU_CK,
}