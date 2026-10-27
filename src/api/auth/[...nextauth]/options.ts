import {NextAuthOptions} from 'next-auth'
import CredentialsProviders from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';


export const authOptions: NextAuthOptions = {
    providers:[
        CredentialsProviders({
            id: "credentials",
            name: "Credentials",
            credentials:{
                username: {label: "Username", type:"text", placeholder: "unknown"},
                password: {label: "password", type: "password"}
            },
            async authorize(credentials:any):Promise<any>{
                await dbConnect()
                try {
                    const user = await UserModel.findOne({
                        $or:[
                            {email:credentials.identifier},
                            {username: credentials.identifier}
                        ]
                    })
                    if(!user){
                        throw new Error('no user found with this email')
                    }
                    if(!user.isVerified){
                        throw new Error('please verify your account before login')
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    if(isPasswordCorrect){
                        return user
                    }else{
                        throw new Error("incorrect password");
                        
                    }
                } catch (err:any) {
                    throw new Error(err)
                    
                }
            }
        })
    ],
    callbacks: {
        async jwt({token, user}){
            if(user){
                token._id = user._id?.toString()
                token.isVerified = user.isVerified
                token.isAcceptingMessages =user.isAcceptingMessages;
                token.username = user.username
            }
            return token
        },
        async session({session, token}){
            if(token){
                session.user._id = token._id
            }
            return session
        }
    },
    pages: {
        signIn: '/sign-In'
    },
    session: {
        strategy: "jwt"
    },
    secret:process.env.NEXTAUTH_SECRET
}