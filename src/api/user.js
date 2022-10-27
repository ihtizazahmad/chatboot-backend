import { User } from '../models/User.js'
import { subUser } from '../models/subUser.js'
import jwt from "jsonwebtoken";
import bycrypt from "bcryptjs"
import crypto from "crypto"
import nodemailer from "nodemailer"







const transporter = nodemailer.createTransport({service:"gmail",auth:{user:"workspatron@gmail.com",pass:"mhoumpxfstzptawc"},from:"workspatron@gmail.com"})
transporter.verify((err, succ) => {
    if (err) {
      console.log(err);
    } else if (succ) {
      console.log("Mail Service Connected");
    }
  });


export const userSignup= (req, res) => {
    let status="user"
 
 const {email,password}= req.body
 User.findOne({ email: email })
  
      .then((saveUser) => {
          if (saveUser) {
              return res.status(422).json({ message: 'already registered' })
          }
              bycrypt.hash(password, 12)
              .then((hashedpassword) => {
                const  Data={...req.body,password:hashedpassword,status}
                  const user = new User(
                      Data
                  )
                  user.save()
                      .then(user => {
                          const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)
                          const userDetail ={...user,...user.password=undefined}
                          res.json({ message: "register successfully",token,user:userDetail._doc })
                      }).catch((err) => {
                          console.log(err)
                      })
              })
      }).catch((err) => {
          console.log(err)
      })

}

export const userLogin = async (req, res) => {
    const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "please add email or password" })
}
const user = await User.findOne({ email });
if (!user) {
    return res.status(422).send({ error: "email not register" });
  }
  bycrypt.compare(password, user.password)
  .then(doMatch => {
      if (doMatch) {
          const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)
          const userDetail ={...user,...user.password=undefined}
          res.json({ message: "Successfull Login", token, user:userDetail._doc})
      } else {
          return res.status(422).json({ error: 'invalid password' })
      }
  })
}


  export const userSocialLogin= (req, res) => {
      let status="user"
   subUser.findOne({ email: email })
    
        .then((saveUser) => {
            if (saveUser) {
                const token = jwt.sign({ _id: saveUser._id }, process.env.JWT_SECRET)
                const userDetail ={...saveUser}
             return   res.json({ message: "login successfully",token,user:userDetail._doc })
            }
                
                  const  Data={...req.body,status}
                    const user = new User(
                        Data
                    )
                    user.save()
                        .then(user => {
                            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)
                            const userDetail ={...user}
                            res.json({ message: "register successfully",token,user:userDetail._doc })
                        }).catch((err) => {
                            console.log(err)
                        })
            
        }).catch((err) => {
            console.log(err)
        })
  
  }


//   forgot password 

export const forgotPass= (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
        }
        const token = buffer.toString("hex")
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    return res.status(422).json({ error: "applicant do not exist with this email" })
                }
                user.resetToken = token
                user.expireToken = Date.now() + 3600000
                user.save().then((result) => 
                {
                    transporter.sendMail({
                        to: user.email,
                        from: "no-reply-www.brianspk.com",
                        subject: "password reset",
                        html: `
                        <h1>Tidio-Chat</h1>
                    <p>You requested for password reset</p>
                    <h5>click in this <a href="${process.env.LINK}reset-pass/${token}">link</a> to reset password</h5>
                    `
                    })
                    res.json({ message: "check your email" })
                })

            })
    })
}

        // new password 

export const newPass=(req, res) => {
    const d = new Date();
let time = d.getTime();
    console.log("req :",req.body,time,"full date :",d,"time :",d.toLocaleTimeString())
            const newPassword = req.body.password
            const sentToken = req.body.token
            User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
        
                .then(user => {
                    console.log("user :",user)
                    if (!user) {
                        return res.status(422).json({ error: "Try again session expired" })
                    }
                    bycrypt.hash(newPassword, 12).then(hashedpassword => {
                        user.password = hashedpassword
                        user.resetToken = undefined
                        user.expireToken = undefined
                        user.save().then((saveduser) => {
                            res.json({ message: "password updated success" })
                        })
                    })
                }).catch(err => {
                    console.log(err)
                })
        }

    
     
        // sub user portion 

    
export const subUserCreate= (req, res) => {
 const {name,createdby}= req.body
 if(!name){
    return res.status(422).json({message:"name is required"})
 }
 subUser.find( {$and: [{  name: name }, { createdby:createdby}]})
  
      .then((saveUser) => {
          if (saveUser.length >0) {
              return res.status(422).json({ message: 'already registered' })
          }
              const user = new subUser(req.body)
                  user.save()
                      .then(user => {
                          res.json({ message: "created successfully",user})
                      }).catch((err) => {
                          console.log(err)
                      })
      }).catch((err) => {
          console.log(err)
      })

}
