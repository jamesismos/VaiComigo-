import { z } from "zod";

export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const validatedAddressSchema = coordinateSchema.extend({
  id: z.string().min(1),
  label: z.string().min(2).max(160),
  fullAddress: z.string().min(3).max(300),
  confidence: z.enum(["exact", "high", "medium", "low"]),
});

export const rideRequestSchema = z.object({
  cityId: z.string().uuid(),
  origin: validatedAddressSchema,
  destination: validatedAddressSchema,
  stops: z.array(validatedAddressSchema).max(3),
  paymentMethod: z.enum(["cash", "driver_pix"]),
  category: z.enum(["passenger", "pet", "delivery", "market"]),
});

export type RideRequestInput = z.infer<typeof rideRequestSchema>;
