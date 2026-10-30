import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {success, z} from 'zod';
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
})

export async function GET(request:Request) {
    await dbConnect()

    try {
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }
        //validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam)
        console.log(result) //TODO:remove
        if (!result.success) {
    const flattened = z.flattenError(result.error);
    const usernameErrors = flattened.fieldErrors.username || [];
    return Response.json({
        success: false,
        message:usernameErrors?.length > 0
        ?usernameErrors.join(','):'invalid query parameters'
    },{status: 400})
}

    const {username} = result.data

    const existingVerifiedUser = await UserModel.findOne({username, isVerified: true})
    if(existingVerifiedUser){
        return Response.json({
        success: false,
        message:'Username is already taken'
    },{status: 400})

    }
    return Response.json({
        success: true,
        message:'Username is unique'
    },{status: 400})

    } catch (error) {
        console.error('error checking username', error)
        return Response.json({
            success: false,
            message: "error checking username",
        },
    {status: 500})
    }
    
}