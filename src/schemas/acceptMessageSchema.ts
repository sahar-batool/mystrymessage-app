import {z} from 'zod'

export const AcceptMessageSchema = z.object({
    accepMessages: z.boolean()
})