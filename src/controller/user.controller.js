import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../model/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"


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

export { registerUser }