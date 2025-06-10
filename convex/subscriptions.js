import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update a subscription
export const createOrUpdateSubscription = mutation({
  args: {
    userEmail: v.string(),
    subscriptionId: v.string(),
    planId: v.string(),
    status: v.string(),
    startDate: v.string(),
    nextBillingDate: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Check if subscription already exists
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_email", (q) => q.eq("userEmail", args.userEmail))
      .first();

    if (existingSubscription) {
      // Update existing subscription
      await ctx.db.patch(existingSubscription._id, {
        subscriptionId: args.subscriptionId,
        planId: args.planId,
        status: args.status,
        startDate: args.startDate,
        nextBillingDate: args.nextBillingDate,
        stripeSubscriptionId: args.stripeSubscriptionId
      });
      
      // Update user's upgrade status
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.userEmail))
        .first();
        
      if (user) {
        await ctx.db.patch(user._id, {
          upgrade: args.status === 'active'
        });
      }
      
      return existingSubscription._id;
    } else {
      // Create new subscription
      const subscriptionId = await ctx.db.insert("subscriptions", {
        userEmail: args.userEmail,
        subscriptionId: args.subscriptionId,
        planId: args.planId,
        status: args.status,
        startDate: args.startDate,
        nextBillingDate: args.nextBillingDate,
        stripeSubscriptionId: args.stripeSubscriptionId
      });
      
      // Update user's upgrade status
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.userEmail))
        .first();
        
      if (user) {
        await ctx.db.patch(user._id, {
          upgrade: args.status === 'active'
        });
      }
      
      return subscriptionId;
    }
  },
});

// Get user's subscription status
export const getUserSubscription = query({
  args: {
    userEmail: v.string()
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_email", (q) => q.eq("userEmail", args.userEmail))
      .first();

    return subscription;
  },
});

// Cancel a subscription
export const cancelSubscription = mutation({
  args: {
    userEmail: v.string(),
    cancelledAt: v.string()
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_email", (q) => q.eq("userEmail", args.userEmail))
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        status: 'cancelled',
        cancelledAt: args.cancelledAt
      });
      
      // Update user's upgrade status
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.userEmail))
        .first();
        
      if (user) {
        await ctx.db.patch(user._id, {
          upgrade: false
        });
      }
      
      return subscription._id;
    }
    
    return null;
  },
});

// Update subscription status
export const updateSubscriptionStatus = mutation({
  args: {
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionId: v.string(),
    status: v.string(),
    nextBillingDate: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscription_id", (q) => q.eq("subscriptionId", args.subscriptionId))
      .first();

    if (subscription) {
      const updateData = {
        status: args.status
      };
      
      if (args.nextBillingDate) {
        updateData.nextBillingDate = args.nextBillingDate;
      }
      
      if (args.stripeSubscriptionId) {
        updateData.stripeSubscriptionId = args.stripeSubscriptionId;
      }
      
      await ctx.db.patch(subscription._id, updateData);
      
      // Update user's upgrade status
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), subscription.userEmail))
        .first();
        
      if (user) {
        await ctx.db.patch(user._id, {
          upgrade: args.status === 'active'
        });
      }
      
      return subscription._id;
    }
    
    return null;
  },
});

// Check if user has active subscription
export const hasActiveSubscription = query({
  args: {
    userEmail: v.string()
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_email", (q) => q.eq("userEmail", args.userEmail))
      .first();

    return subscription && subscription.status === 'active';
  },
});
