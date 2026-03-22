/**
 * Zod validation schemas for the chunked analysis pipeline endpoints.
 */

import { z } from "zod";

const parsedReviewSchema = z.object({
  content: z.string().min(1),
  rating: z.number().min(1).max(5).optional(),
  author: z.string().optional(),
  date: z.string().optional(),
  platform: z.string().optional(),
  version: z.string().optional(),
});

export const initRequestSchema = z.object({
  appName: z.string().min(1).trim(),
  platform: z.string().optional(),
  reviews: z.array(parsedReviewSchema).min(1),
});

const dimensionScoresSchema = z.object({
  love: z.number(),
  frustration: z.number(),
  loyalty: z.number(),
  momentum: z.number(),
  wom: z.number(),
});

export const reportRequestSchema = z.object({
  analysisId: z.string().uuid(),
  appName: z.string().min(1),
  platform: z.string().optional(),
  reviewSummaries: z.array(z.string()),
  dimensionAverages: dimensionScoresSchema,
  vibeScore: z.number(),
  reviewCount: z.number().int().positive(),
});

const competitorInputSchema = z.object({
  appId: z.string().min(1),
  name: z.string().min(1),
  platform: z.enum(["android", "ios"]),
  storeId: z.number().optional(),
});

export const competitorRequestSchema = z.object({
  analysisId: z.string().uuid(),
  competitor: competitorInputSchema,
});

export const finalizeRequestSchema = z.object({
  analysisId: z.string().uuid(),
  vibeScore: z.number(),
  reviewCount: z.number().int().positive(),
  competitorCount: z.number().int().min(0),
  appName: z.string().min(1),
  userEmail: z.string().optional(),
});
