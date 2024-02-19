import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { FriendshipStatusSchema } from '@/utils/server/friendship-schemas'
import { authGuard } from '@/server/trpc/middlewares/auth-guard'
import { procedure } from '@/server/trpc/procedures'
import { IdSchema } from '@/utils/server/base-schemas'
import { router } from '@/server/trpc/router'

const SendFriendshipRequestInputSchema = z.object({
  friendUserId: IdSchema,
})

const canSendFriendshipRequest = authGuard.unstable_pipe(
  async ({ ctx, rawInput, next }) => {
    const { friendUserId } = SendFriendshipRequestInputSchema.parse(rawInput)

    await ctx.db
      .selectFrom('users')
      .where('users.id', '=', friendUserId)
      .select('id')
      .limit(1)
      .executeTakeFirstOrThrow(
        () =>
          new TRPCError({
            code: 'BAD_REQUEST',
          })
      )

    return next({ ctx })
  }
)

const AnswerFriendshipRequestInputSchema = z.object({
  friendUserId: IdSchema,
})

const canAnswerFriendshipRequest = authGuard.unstable_pipe(
  async ({ ctx, rawInput, next }) => {
    const { friendUserId } = AnswerFriendshipRequestInputSchema.parse(rawInput)

    await ctx.db
      .selectFrom('friendships')
      .where('friendships.userId', '=', friendUserId)
      .where('friendships.friendUserId', '=', ctx.session.userId)
      .where(
        'friendships.status',
        '=',
        FriendshipStatusSchema.Values['requested']
      )
      .select('friendships.id')
      .limit(1)
      .executeTakeFirstOrThrow(() => {
        throw new TRPCError({
          code: 'BAD_REQUEST',
        })
      })

    return next({ ctx })
  }
)

export const friendshipRequestRouter = router({
  send: procedure
    .use(canSendFriendshipRequest)
    .input(SendFriendshipRequestInputSchema)
    .mutation(async ({ ctx, input }) => {
      
      /**
       * Question 3: Fix bug
       *
       * Fix a bug where our users could not send a friendship request after
       * they'd previously been declined. Steps to reproduce:
       *  1. User A sends a friendship request to User B
       *  2. User B declines the friendship request
       *  3. User A tries to send another friendship request to User B -> ERROR
       *
       * Instructions:
       *  - Go to src/server/tests/friendship-request.test.ts, enable the test
       * scenario for Question 3
       *  - Run `yarn test` to verify your answer
       */
      // Kiểm tra xem đã tồn tại mối quan hệ bạn bè trước đó giữa hai người dùng hay không
        //   const existingFriendship = await ctx.db
        //   .selectFrom('friendships')
        //   .where('userId', '=', ctx.session.userId)
        //   .where('friendUserId', '=', input.friendUserId)
        //   .executeTakeFirst();

        //em bị lỗi khúc này mà không đủ thời gian để fix được nó gây ảnh hưởng khá nhiều đến bài làm của em ở câu 1 (kịch bản 2) câu 3 (kịch bản 2)

        // if (existingFriendship) {
        //   const friendshipWithStatus = existingFriendship as { status: string };
        //   // Nếu đã tồn tại mối quan hệ, kiểm tra xem mối quan hệ đã từng bị từ chối hay không
        //   if (friendshipWithStatus.status === FriendshipStatusSchema.Values['declined']) {
        //     // Nếu mối quan hệ đã từng bị từ chối, cho phép người dùng gửi lại yêu cầu
        //     return ctx.db
        //       .updateTable('friendships')
        //       .set({
        //         status: FriendshipStatusSchema.Values['requested'],
        //       })
        //       .where('userId', '=', ctx.session.userId)
        //       .where('friendUserId', '=', input.friendUserId)
        //       .execute();
        //   } else {
        //     // Nếu mối quan hệ vẫn đang tồn tại hoặc đang chờ phản hồi, trả về lỗi
        //     throw new TRPCError({
        //       code: 'BAD_REQUEST',
        //       message: 'Friendship request already sent or pending.',
        //     });
        //   }
        // } else {
        //   // Nếu chưa tồn tại mối quan hệ, thêm một mối quan hệ mới
        //   return ctx.db
        //     .insertInto('friendships')
        //     .values({
        //       userId: ctx.session.userId,
        //       friendUserId: input.friendUserId,
        //       status: FriendshipStatusSchema.Values['requested'],
        //     })
        //     .execute();
        // }
        return ctx.db
        .insertInto('friendships')
        .values({
          userId: ctx.session.userId,
          friendUserId: input.friendUserId,
          status: FriendshipStatusSchema.Values['requested'],
        })
        .execute()
    }),

    accept: procedure
    .use(canAnswerFriendshipRequest)
    .input(AnswerFriendshipRequestInputSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction().execute(async (t) => {
        //em bị lỗi khúc này mà không đủ thời gian để fix được nó gây ảnh hưởng khá nhiều đến bài làm của em ở câu 1 (kịch bản 2) câu 3 (kịch bản 2)
        // vì lần đầu thực hiện code kiểu này nên em kh truy cập được vào bảng 'friendship' để sử dụng
        // Kiểm tra xem đã tồn tại mối quan hệ bạn bè trong trạng thái 'requested' giữa hai người dùng hay chưa
        // const existingRequestedFriendship = await t
        //   .selectFrom('friendships')
        //   .where('userId', '=', input.friendUserId)
        //   .where('friendUserId', '=', ctx.session.userId)
        //   .where('status', '=', FriendshipStatusSchema.Values['requested'])
        //   .executeTakeFirst();

        // //console.log("existingRequestedFriendship:", existingRequestedFriendship);
  
        
        // if (existingRequestedFriendship) {
        //   // Nếu đã tồn tại mối quan hệ bạn bè ở trạng thái 'requested', cập nhật thành 'accepted'
        //   await t
        //     .updateTable('friendships')
        //     .set({
        //       status: FriendshipStatusSchema.Values['accepted'],
        //     })
        //     .where('userId', '=', input.friendUserId)
        //     .where('friendUserId', '=', ctx.session.userId)
        //     .where('status', '=', FriendshipStatusSchema.Values['requested'])
        //     .execute();
          
        //   await t
        //     .insertInto('friendships')
        //     .values({
        //       userId: ctx.session.userId,
        //       friendUserId: input.friendUserId,
        //       status: FriendshipStatusSchema.Values['accepted'],
        //     })
        //     .execute()
        // }
        // else {
        //   throw new TRPCError({
        //     code: 'NOT_FOUND',
        //     message: 'Requested friendship not found.',
        //   });
  
        await t
        .updateTable('friendships')
        .set({
          status: FriendshipStatusSchema.Values['accepted'],
        })
        
        .where('friendships.userId', '=', input.friendUserId)
        .where('friendships.friendUserId', '=', ctx.session.userId)
        
        
        .execute()

        await t
        .insertInto('friendships')
        .values({
          userId: ctx.session.userId,
          friendUserId: input.friendUserId,
          status: FriendshipStatusSchema.Values['accepted'],
        })
        .execute()
      });
    }),
  

  decline: procedure
  .use(canAnswerFriendshipRequest)
  .input(AnswerFriendshipRequestInputSchema)
  .mutation(async ({ ctx, input }) => {
    await ctx.db.transaction().execute(async (t) => {
      // Cập nhật trạng thái yêu cầu thành "declined"
      await t
        .updateTable('friendships')
        .set({
          status: FriendshipStatusSchema.Values['declined'],
        })
        .where('friendships.userId', '=', input.friendUserId)
        .where('friendships.friendUserId', '=', ctx.session.userId)
        .where('friendships.status', '=', FriendshipStatusSchema.Values['requested'])
        .execute()
    })
  }),
})
