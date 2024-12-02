import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createUser = mutation({
    args:{
        email:v.string(),
        userName:v.string(),
        imageUrl:v.string()
    },
    handler:async(ctx,args)=>{
        const user=await ctx.db.query('user').filter((q)=>q.eq(q.field('email'),args.email))
            .collect();
            if(user?.length==0)
            {
                await ctx.db.insert('user',{
                    email:args.email,
                    userName:args.userName,
                    imageUrl:args.imageUrl,
                    upgrade:false
                });
                return 'Inserted New User...'
            }
            return 'user already exists'
    }
})