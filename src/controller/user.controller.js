import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../model/user.model.js"
import  {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken =await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        //now for adding refresh token to user object in db we will do this
        user.refreshToken = refreshToken

        //now jab save krna hoga  refresh token ko baki cheezen jese validate password na chaljye islye isko false krhe h
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Someting went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Implementation for registering a new user
    //1-get user details from front end (in our user models)
    //2-validation like emty email ,email format check, password length check etc
    //3check if user already exists :username or email
    //4-create user object and cthen create entry in db
    //6 remove password password and refresh token field from response
    //7 check for user creation
    //8 return response
    const {username,fullname,email,password,role} = req.body;
    console.log("email",email)

    if ([username, fullname, email, password, role].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required")
}
    
    //check if user or email already exists
    const existedUser = await User.findOne({
        $or: [{ username }, {email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with username or email already exists")

    }

    //create user object and then create entry in db
    const user = await User.create({
    fullname,email,password,role,
    username:username.toLowerCase()
    })

    //check user object bana h k nhi
     //mongo db har object create hone k baad uska unique id generate krta h to agr user object bana h to uska id hoga
    //yaha do cheezein horhi h 1-agr user object bana h to uska id hoga 2-agr user object bana h to uska password aur refresh token hatado usm s
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering user")
    }

    //return response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
        
    )


})
//now we are making login user
const loginUser = asyncHandler(async(req,res)=>{
   /// to dos
    //req body s data le ao
    //username or email
    //find the user
    //password check krdo
    // access and refresh token generate krdo
    //send cookies
    
    //abhi hamne front end m decide nhi kia email ya username chye . password to confirm h
    const {email,username,password} = req.body

    if(!username && !email){
        throw new ApiError(400,"Username or email is required")

    }

    //finding user in db
    // ya to username s dhondlo ya to email s dhondlo
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    //if user not found
    if(!user){
        throw new ApiError(404,"User not found")
    }
    
    //check if password is correct
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid password")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //for sending cookies we need to to create options object

    const options = {
        httpOnly:true,
        secure: true
        //ye krne ka mqsad ye ha k bydefault cookies ko koi bhi modify krskta ha but ye krne ka bad sirf server krskta ha
        }

        return res.status(200).cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200,
            {
                //why sending access token and refresh token in response body as well as in cookies beccaues kia paata user khud hi cookies ko save krna charha ho
                user:loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
         )
        )
        


})
//now creating function for logout
const logoutUser = asyncHandler(async(req,res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken :undefined
            }
        } , 
        {
             new:true
        }
    )

     const options = {
        httpOnly:true,
        secure: true
        //ye krne ka mqsad ye ha k bydefault cookies ko koi bhi modify krskta ha but ye krne ka bad sirf server krskta ha
        }
        return res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged Out"))
})

//access token and refresh token bar bar email and password na dalne ka solution h
//access token short lived hota ha and refresh token long lived
// access token user k pas rhta ha and refresh token db m store hota ha
//if accesstoken expires user sends refresh token and db matches both refresh token then it generates new acces token and refresh token

//now creating end point in which user can refresh its token
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken)
    {
        throw new ApiError(401,"unauthorized request")

    }
    //verify incoming refresh token
 try {
       const decodedToken = jwt.verify(
           incomingRefreshToken
           ,process.env.REFRESH_TOKEN_SECRET
       )
   
       //finding user from decoded token by id
       const user = await User.findById(decodedToken?._id)
   
       if(!user)
       {
            throw new ApiError(401,"invalid refresh token")
       }
   
       if (incomingRefreshToken != user?.refreshToken)
       {
           throw new ApiError(401,"Refresh Token is expired or used")
       }
   
       //now generating new refresh token and acess toen
   
       const options = {
           httpOnly:true,
           secure:true
       }
       const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
   
       return res
       .status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken",newRefreshToken,options)
       .json(
           new ApiResponse(200,
               {accessToken,refreshToken:newRefreshToken},
               "Access token refreshed"
   
           )
       )
 } catch (error) {
    throw new ApiError(401,error?.message || 
        "Invalid refresh token"
    )
 }
})
export {registerUser
    ,loginUser,
    logoutUser,
    refreshAccessToken
}
