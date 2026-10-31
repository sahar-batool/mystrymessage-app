import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export async function POST(request: Request){
    await dbConnect()

    try {
        const {username, code} = await request.json()

        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({username: decodedUsername})
        if(!user){
             return Response.json({
            success: false,
            message: 'user not found'
        },
             )
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotVerified = new Date(user.verifyCodeExpiry) > new Date()

        if(isCodeValid && isCodeNotVerified){
            user.isVerified = true
            await user.save()

               return Response.json({
            success: true,
            message: 'Account verified successfully'
               },
               {status: 200})

            }else if(isCodeNotVerified){
                return Response.json({
                success: false,
                message: 'Verification code has expired, please signup to get new code'
               },
               {status: 400})
            }else{
                return Response.json({
                success: false,
                message: 'incorrect verification code'
               },
               {status: 400})
            }

    } catch (error) {
        console.error('errror registring user', error)
        return Response.json({
            success: false,
            message: 'error registring user'
        },
    {
        status: 500
    })
        
    }
    }

