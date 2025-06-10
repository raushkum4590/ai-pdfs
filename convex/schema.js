import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users:defineTable({
        userName:v.string(),
        email:v.string(),
        imageUrl:v.string(),
        upgrade:v.boolean()
    }),    subscriptions: defineTable({
        userEmail: v.string(),
        subscriptionId: v.string(),
        planId: v.string(),
        status: v.string(), // 'active', 'cancelled', 'suspended', 'expired'
        startDate: v.string(),
        nextBillingDate: v.optional(v.string()),
        cancelledAt: v.optional(v.string()),
        stripeSubscriptionId: v.optional(v.string())
    }).index("by_user_email", ["userEmail"])
      .index("by_subscription_id", ["subscriptionId"]),
    PdfFiles:defineTable({
        fileId:v.string(),
        storageId:v.string(),
        fileName:v.string(),
        fileUrl:v.string(),
        createdBy:v.string()
    }),
    documents: defineTable({
        embedding: v.array(v.number()),
        text: v.string(),
        metadata: v.any(),
      }).vectorIndex("byEmbedding", {
        vectorField: "embedding",
        dimensions: 768,
      }),

})